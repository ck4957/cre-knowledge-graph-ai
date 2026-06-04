export type MonthlyFinancialSnapshot = {
  month: string;
  grossRent: number;
  operatingExpenses: number;
  recoveries: number;
  occupancyRate: number;
  delinquencyRate: number;
};

export type LeaseExpirationBucket = {
  label: string;
  expiringRent: number;
  leases: number;
};

export type ExpenseCategory = {
  category: string;
  amount: number;
};

export type FinancialDashboard = {
  kpis: {
    grossRent: number;
    netOperatingIncome: number;
    occupancyRate: number;
    expenseRatio: number;
    recoveryRatio: number;
    delinquencyRate: number;
  };
  monthly: MonthlyFinancialSnapshot[];
  leaseExpirations: LeaseExpirationBucket[];
  expenseMix: ExpenseCategory[];
  camExposure: ExpenseCategory[];
};

