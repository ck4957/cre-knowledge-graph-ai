import type { MapsDataSource } from "@/lib/connectors/maps/types";
import type { MlsDataSource, MlsSearchCriteria } from "@/lib/connectors/mls/types";
import type { DocumentRepository } from "@/lib/documents/document-repository";

export class DocumentIngestionService {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly mlsDataSource?: MlsDataSource,
    private readonly mapsDataSource?: MapsDataSource
  ) {}

  async ingestTextDocument(input: { id: string; title: string; sourceType: string; text: string; sourceUri?: string }) {
    return this.documents.upsert({
      id: input.id,
      title: input.title,
      sourceType: input.sourceType,
      sourceUri: input.sourceUri,
      chunks: splitIntoChunks(input.text).map((content, index) => ({
        id: `${input.id}-chunk-${index}`,
        content,
        entityRefs: []
      }))
    });
  }

  async ingestMlsListings(criteria: MlsSearchCriteria) {
    if (!this.mlsDataSource) {
      throw new Error("MLS data source is not configured.");
    }

    const listings = await this.mlsDataSource.searchProperties(criteria);

    return Promise.all(
      listings.map(async (listing) => {
        const geocode = this.mapsDataSource ? await this.mapsDataSource.geocode(listing.address) : null;
        const locationText = geocode ? ` Located at ${geocode.latitude}, ${geocode.longitude}.` : "";

        return this.ingestTextDocument({
          id: `mls-${listing.listingKey}`,
          title: `MLS listing ${listing.listingKey}`,
          sourceType: "mls_idx",
          text: `${listing.propertyType ?? "Property"} at ${listing.address}, ${listing.city}, ${listing.state}.${locationText}`,
          sourceUri: undefined
        });
      })
    );
  }
}

export function splitIntoChunks(text: string, maxLength = 800): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [text.slice(0, maxLength)];
  }

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (`${current}\n\n${paragraph}`.trim().length > maxLength && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = `${current}\n\n${paragraph}`.trim();
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

