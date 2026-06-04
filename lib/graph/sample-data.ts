import type { CreEdge, CreNode, LeaseExtraction } from "./types";
import { isActive } from "@/lib/temporal/is-active";

export const graphNodes: CreNode[] = [
  {
    id: "asset-buffalo-industrial",
    type: "Asset",
    label: "Buffalo Campus",
    properties: {
      market: "Buffalo, NY",
      assetClass: "Industrial"
    }
  },
  {
    id: "building-a",
    type: "Building",
    label: "Building A",
    properties: {
      rentableSquareFeet: 180000
    }
  },
  {
    id: "floor-1",
    type: "Floor",
    label: "Level 1",
    properties: {
      clearHeight: "28 ft"
    }
  },
  {
    id: "space-110",
    type: "Space",
    label: "Space 110",
    properties: {
      rentableSquareFeet: 42000,
      use: "Warehouse"
    }
  },
  {
    id: "tenant-northstar",
    type: "Tenant",
    label: "Northstar Logistics",
    properties: {
      normalizedName: "Northstar Logistics LLC"
    }
  },
  {
    id: "lease-2024-northstar",
    type: "Lease",
    label: "Lease 2024-01",
    properties: {
      baseRent: "$24.50 psf",
      renewalOption: true
    }
  },
  {
    id: "amendment-cam-2026",
    type: "Amendment",
    label: "CAM Amendment",
    properties: {
      effectiveDate: "2026-04-01"
    }
  },
  {
    id: "obligation-cam",
    type: "Obligation",
    label: "CAM true-up",
    properties: {
      category: "Financial",
      owner: "Tenant"
    }
  },
  {
    id: "permit-loading-dock",
    type: "Permit",
    label: "Dock Permit",
    properties: {
      jurisdiction: "Erie County"
    }
  }
];

export const graphEdges: CreEdge[] = [
  {
    id: "asset-contains-building",
    type: "CONTAINS",
    source: "asset-buffalo-industrial",
    target: "building-a",
    label: "Buffalo Campus contains Building A",
    confidence: 0.98,
    sourceSystem: "property_management",
    evidence: "Property management asset hierarchy."
  },
  {
    id: "building-contains-floor",
    type: "CONTAINS",
    source: "building-a",
    target: "floor-1",
    label: "Building A contains Level 1",
    confidence: 0.96,
    sourceSystem: "property_management",
    evidence: "Rent roll floor plan import."
  },
  {
    id: "floor-contains-space",
    type: "CONTAINS",
    source: "floor-1",
    target: "space-110",
    label: "Level 1 contains Space 110",
    confidence: 0.95,
    sourceSystem: "property_management",
    evidence: "Current stacking plan."
  },
  {
    id: "tenant-leases-space",
    type: "LEASES",
    source: "tenant-northstar",
    target: "space-110",
    label: "Northstar leases Space 110",
    validFrom: "2024-01-01",
    validTo: "2029-12-31",
    confidence: 0.93,
    sourceSystem: "lease_pdf",
    evidence: "Lease section 1.2 identifies Space 110 as premises."
  },
  {
    id: "lease-supported-by-tenant",
    type: "SUPPORTED_BY",
    source: "lease-2024-northstar",
    target: "tenant-northstar",
    label: "Lease names Northstar as tenant",
    validFrom: "2024-01-01",
    confidence: 0.92,
    sourceSystem: "lease_pdf",
    evidence: "Opening recital names Northstar Logistics LLC."
  },
  {
    id: "lease-has-amendment",
    type: "HAS_AMENDMENT",
    source: "lease-2024-northstar",
    target: "amendment-cam-2026",
    label: "Lease has 2026 CAM amendment",
    validFrom: "2026-04-01",
    confidence: 0.89,
    sourceSystem: "lease_pdf",
    evidence: "Amendment references original lease dated 2024-01-01."
  },
  {
    id: "amendment-creates-obligation",
    type: "CREATES_OBLIGATION",
    source: "amendment-cam-2026",
    target: "obligation-cam",
    label: "Amendment creates CAM true-up obligation",
    validFrom: "2026-04-01",
    confidence: 0.87,
    sourceSystem: "lease_pdf",
    evidence: "Section 3 modifies tenant CAM reconciliation duty."
  },
  {
    id: "permit-relates-space",
    type: "RELATES_TO",
    source: "permit-loading-dock",
    target: "space-110",
    label: "Loading dock permit relates to Space 110",
    validFrom: "2026-02-15",
    validTo: "2026-09-30",
    confidence: 0.82,
    sourceSystem: "permit_record",
    evidence: "Permit record lists dock bay adjacent to Space 110."
  }
];

export const leaseExtractionExample: LeaseExtraction = {
  documentId: "doc-lease-northstar-2024",
  confidence: 0.91,
  fields: {
    tenantName: "Northstar Logistics LLC",
    landlordName: "Buffalo Industrial Owner LLC",
    assetName: "Buffalo Industrial Campus",
    spaceIdentifier: "Space 110",
    termStart: "2024-01-01",
    termEnd: "2029-12-31",
    baseRent: "$24.50 psf",
    camResponsibility: "Tenant pays annual CAM true-up after 2026 amendment.",
    renewalOption: true,
    assignmentRestriction: "Landlord consent required, not unreasonably withheld."
  }
};

export function activeRelationships(asOf: Date): CreEdge[] {
  return graphEdges.filter((edge) => isActive(edge, asOf)).filter((edge) => edge.validFrom || edge.validTo);
}

