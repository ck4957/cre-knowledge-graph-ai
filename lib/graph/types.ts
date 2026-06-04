export type CreEntityType =
  | "Asset"
  | "Building"
  | "Floor"
  | "Space"
  | "Tenant"
  | "Lease"
  | "Amendment"
  | "Permit"
  | "Obligation"
  | "Document";

export type CreRelationshipType =
  | "CONTAINS"
  | "PART_OF"
  | "LEASES"
  | "OCCUPIES"
  | "HAS_AMENDMENT"
  | "CREATES_OBLIGATION"
  | "RELATES_TO"
  | "SUPPORTED_BY";

export type SourceSystem = "lease_pdf" | "permit_record" | "property_management" | "financial_system" | "reviewer";

export type CreNode = {
  id: string;
  type: CreEntityType;
  label: string;
  properties: Record<string, string | number | boolean | null>;
};

export type CreEdge = {
  id: string;
  type: CreRelationshipType;
  source: string;
  target: string;
  label: string;
  validFrom?: string;
  validTo?: string;
  confidence: number;
  sourceSystem: SourceSystem;
  evidence: string;
};

export type LeaseExtractionField =
  | "tenantName"
  | "landlordName"
  | "assetName"
  | "spaceIdentifier"
  | "termStart"
  | "termEnd"
  | "baseRent"
  | "camResponsibility"
  | "renewalOption"
  | "assignmentRestriction";

export type LeaseExtraction = {
  documentId: string;
  confidence: number;
  fields: Record<LeaseExtractionField, string | boolean | null>;
};

