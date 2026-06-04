import type { LeaseExtractionField } from "@/lib/graph/types";

export type LeaseExtractionSchemaField = {
  key: LeaseExtractionField;
  label: string;
  description: string;
  required: boolean;
};

export const leaseExtractionSchema: LeaseExtractionSchemaField[] = [
  {
    key: "tenantName",
    label: "Tenant legal name",
    description: "The legal tenant entity named in the lease or amendment.",
    required: true
  },
  {
    key: "landlordName",
    label: "Landlord legal name",
    description: "The landlord or owner entity granting occupancy rights.",
    required: true
  },
  {
    key: "assetName",
    label: "Asset or property name",
    description: "The property, campus, or asset to which the lease applies.",
    required: true
  },
  {
    key: "spaceIdentifier",
    label: "Premises identifier",
    description: "Suite, floor, bay, unit, or space identifier.",
    required: true
  },
  {
    key: "termStart",
    label: "Term start",
    description: "The date the tenant's lease term begins.",
    required: true
  },
  {
    key: "termEnd",
    label: "Term end",
    description: "The date the tenant's current lease term expires.",
    required: true
  },
  {
    key: "baseRent",
    label: "Base rent",
    description: "Base rent rate, amount, or rent schedule summary.",
    required: false
  },
  {
    key: "camResponsibility",
    label: "CAM responsibility",
    description: "Common area maintenance obligations and reconciliation terms.",
    required: false
  },
  {
    key: "renewalOption",
    label: "Renewal option",
    description: "Whether the tenant has a renewal or extension option.",
    required: false
  },
  {
    key: "assignmentRestriction",
    label: "Assignment restriction",
    description: "Consent, transfer, assignment, or sublease constraints.",
    required: false
  }
];

