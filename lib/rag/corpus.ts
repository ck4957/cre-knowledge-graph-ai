export type CorpusDocument = {
  id: string;
  title: string;
  sourceType: "lease_pdf" | "amendment_pdf" | "permit_record" | "operations_note";
  chunks: Array<{
    id: string;
    content: string;
    entityRefs: string[];
  }>;
};

export const corpusDocuments: CorpusDocument[] = [
  {
    id: "doc-lease-northstar-2024",
    title: "Northstar Logistics Lease 2024",
    sourceType: "lease_pdf",
    chunks: [
      {
        id: "chunk-lease-premises",
        entityRefs: ["tenant-northstar", "space-110", "lease-2024-northstar"],
        content:
          "Northstar Logistics LLC leases Space 110 at Buffalo Industrial Campus Building A for warehouse and distribution operations from 2024-01-01 through 2029-12-31."
      },
      {
        id: "chunk-lease-assignment",
        entityRefs: ["tenant-northstar", "lease-2024-northstar"],
        content:
          "The tenant may not assign the lease or sublet the premises without landlord consent, which may not be unreasonably withheld."
      },
      {
        id: "chunk-lease-renewal",
        entityRefs: ["tenant-northstar", "lease-2024-northstar"],
        content:
          "The lease includes one five-year renewal option if Northstar gives notice at least 180 days before the current expiration date."
      }
    ]
  },
  {
    id: "doc-amendment-cam-2026",
    title: "CAM Reconciliation Amendment 2026",
    sourceType: "amendment_pdf",
    chunks: [
      {
        id: "chunk-cam-trueup",
        entityRefs: ["amendment-cam-2026", "obligation-cam", "tenant-northstar"],
        content:
          "Effective 2026-04-01, the amendment modifies common area maintenance reimbursement. Northstar must pay an annual CAM true-up within 30 days of landlord statement delivery."
      },
      {
        id: "chunk-cam-audit",
        entityRefs: ["amendment-cam-2026", "obligation-cam"],
        content:
          "The tenant may audit CAM backup materials once per calendar year, provided written notice is delivered within 45 days after receiving the reconciliation package."
      }
    ]
  },
  {
    id: "doc-permit-loading-dock-2026",
    title: "Loading Dock Permit 2026",
    sourceType: "permit_record",
    chunks: [
      {
        id: "chunk-dock-permit",
        entityRefs: ["permit-loading-dock", "space-110"],
        content:
          "Erie County permit record authorizes loading dock resurfacing adjacent to Space 110 from 2026-02-15 through 2026-09-30 and requires tenant coordination for dock access interruptions."
      }
    ]
  }
];

