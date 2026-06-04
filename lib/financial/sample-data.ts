import type { ExpenseCategory, LeaseExpirationBucket, MonthlyFinancialSnapshot } from "./types";

export const monthlyFinancialSnapshots: MonthlyFinancialSnapshot[] = [
  { month: "Jan", grossRent: 302000, operatingExpenses: 118000, recoveries: 42000, occupancyRate: 0.91, delinquencyRate: 0.028 },
  { month: "Feb", grossRent: 309000, operatingExpenses: 121000, recoveries: 43500, occupancyRate: 0.92, delinquencyRate: 0.024 },
  { month: "Mar", grossRent: 315000, operatingExpenses: 124000, recoveries: 45200, occupancyRate: 0.925, delinquencyRate: 0.021 },
  { month: "Apr", grossRent: 326000, operatingExpenses: 129000, recoveries: 50100, occupancyRate: 0.94, delinquencyRate: 0.018 },
  { month: "May", grossRent: 331000, operatingExpenses: 132000, recoveries: 51800, occupancyRate: 0.945, delinquencyRate: 0.016 },
  { month: "Jun", grossRent: 338000, operatingExpenses: 134000, recoveries: 53600, occupancyRate: 0.95, delinquencyRate: 0.014 }
];

export const leaseExpirationBuckets: LeaseExpirationBucket[] = [
  { label: "0-6 mo", expiringRent: 64000, leases: 2 },
  { label: "6-12 mo", expiringRent: 118000, leases: 4 },
  { label: "12-24 mo", expiringRent: 212000, leases: 7 },
  { label: "24+ mo", expiringRent: 404000, leases: 13 }
];

export const expenseMix: ExpenseCategory[] = [
  { category: "Taxes", amount: 312000 },
  { category: "Insurance", amount: 118000 },
  { category: "Utilities", amount: 96000 },
  { category: "Repairs", amount: 144000 },
  { category: "Management", amount: 82000 }
];

export const camExposure: ExpenseCategory[] = [
  { category: "Recoverable CAM", amount: 284000 },
  { category: "Owner CAM", amount: 76000 },
  { category: "Audit risk", amount: 42000 },
  { category: "Unbilled true-up", amount: 31500 }
];

