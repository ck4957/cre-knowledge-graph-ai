import { PDFParse } from "pdf-parse";
import type { DocumentParser, ParsedDocument } from "./types";

export class PdfDocumentParser implements DocumentParser {
  async parse(input: Buffer, fileName: string): Promise<ParsedDocument> {
    const parser = new PDFParse({ data: input });

    try {
      const [textResult, infoResult] = await Promise.all([parser.getText(), parser.getInfo()]);
      const info = infoResult.info as Record<string, string | undefined>;

      return {
        title: info.Title ?? fileName,
        text: textResult.text,
        metadata: {
          pages: textResult.total,
          author: info.Author ?? null,
          subject: info.Subject ?? null
        }
      };
    } finally {
      await parser.destroy();
    }
  }
}
