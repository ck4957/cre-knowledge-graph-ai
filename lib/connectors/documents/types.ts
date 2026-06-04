export type ParsedDocument = {
  title: string;
  text: string;
  metadata: Record<string, string | number | boolean | null>;
};

export interface DocumentParser {
  parse(input: Buffer, fileName: string): Promise<ParsedDocument>;
}

