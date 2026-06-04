export const EMBEDDING_DIMENSIONS = 8;

export type EmbeddingProviderName = "deterministic" | "http";

export type EmbeddingProviderConfig = {
  provider: EmbeddingProviderName;
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  responsePath?: string;
};

export type EmbeddingProvider = {
  name: EmbeddingProviderName;
  embed(text: string): Promise<number[]>;
};

const tokenWeights = new Map<string, number>([
  ["lease", 1.6],
  ["amendment", 1.5],
  ["tenant", 1.4],
  ["obligation", 1.5],
  ["permit", 1.3],
  ["space", 1.2],
  ["cam", 1.7],
  ["renewal", 1.3],
  ["assignment", 1.2],
  ["risk", 1.2]
]);

export function embedText(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenizeForEmbedding(text);

  for (const token of tokens) {
    const index = hashToken(token) % EMBEDDING_DIMENSIONS;
    vector[index] += tokenWeights.get(token) ?? 1;
  }

  return normalize(vector);
}

export async function embedTextAsync(text: string, config: EmbeddingProviderConfig = getEmbeddingProviderConfig()): Promise<number[]> {
  return createEmbeddingProvider(config).embed(text);
}

export function getEmbeddingProviderConfig(): EmbeddingProviderConfig {
  const provider = process.env.EMBEDDING_PROVIDER ?? "deterministic";

  if (provider !== "deterministic" && provider !== "http") {
    throw new Error(`Unsupported EMBEDDING_PROVIDER "${provider}". Use deterministic or http.`);
  }

  return {
    provider,
    apiUrl: process.env.EMBEDDING_API_URL,
    apiKey: process.env.EMBEDDING_API_KEY,
    model: process.env.EMBEDDING_MODEL,
    responsePath: process.env.EMBEDDING_RESPONSE_PATH
  };
}

export function createEmbeddingProvider(config: EmbeddingProviderConfig): EmbeddingProvider {
  if (config.provider === "http") {
    return createHttpEmbeddingProvider(config);
  }

  return {
    name: "deterministic",
    async embed(text: string) {
      return embedText(text);
    }
  };
}

export function cosineSimilarity(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
}

export function vectorLiteral(vector: number[]): string {
  return `[${vector.map((value) => value.toFixed(6)).join(",")}]`;
}

export function tokenizeForEmbedding(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token.length > 2);
}

function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

function hashToken(token: string): number {
  let hash = 0;

  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function createHttpEmbeddingProvider(config: EmbeddingProviderConfig): EmbeddingProvider {
  if (!config.apiUrl) {
    throw new Error("EMBEDDING_API_URL is required when EMBEDDING_PROVIDER=http.");
  }

  return {
    name: "http",
    async embed(text: string) {
      const response = await fetch(config.apiUrl as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          input: text,
          model: config.model
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding provider returned ${response.status}.`);
      }

      const payload = (await response.json()) as unknown;
      const embedding = readEmbeddingFromPayload(payload, config.responsePath ?? "embedding");

      if (!embedding.every((value) => Number.isFinite(value))) {
        throw new Error("Embedding provider returned non-numeric values.");
      }

      return normalize(embedding);
    }
  };
}

function readEmbeddingFromPayload(payload: unknown, responsePath: string): number[] {
  const value = responsePath.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, payload);

  if (!Array.isArray(value)) {
    throw new Error(`Embedding response did not contain an array at "${responsePath}".`);
  }

  return value.map((item) => {
    if (typeof item !== "number") {
      throw new Error(`Embedding response contained a non-number value at "${responsePath}".`);
    }

    return item;
  });
}
