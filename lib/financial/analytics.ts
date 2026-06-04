import { camExposure, expenseMix, leaseExpirationBuckets, monthlyFinancialSnapshots } from "./sample-data";
import type { ExpenseCategory, FinancialDashboard, LeaseExpirationBucket, MonthlyFinancialSnapshot } from "./types";

export function buildFinancialDashboard(input?: {
  monthly?: MonthlyFinancialSnapshot[];
  leaseExpirations?: LeaseExpirationBucket[];
  expenseMix?: ExpenseCategory[];
  camExposure?: ExpenseCategory[];
}): FinancialDashboard {
  const monthly = input?.monthly ?? monthlyFinancialSnapshots;
  const expirations = input?.leaseExpirations ?? leaseExpirationBuckets;
  const expenses = input?.expenseMix ?? expenseMix;
  const cam = input?.camExposure ?? camExposure;
  const latest = monthly.at(-1);

  if (!latest) {
    throw new Error("At least one monthly financial snapshot is required.");
  }

  const netOperatingIncome = latest.grossRent + latest.recoveries - latest.operatingExpenses;
  const expenseRatio = latest.operatingExpenses / latest.grossRent;
  const recoveryRatio = latest.recoveries / latest.operatingExpenses;

  return {
    kpis: {
      grossRent: latest.grossRent,
      netOperatingIncome,
      occupancyRate: latest.occupancyRate,
      expenseRatio,
      recoveryRatio,
      delinquencyRate: latest.delinquencyRate
    },
    monthly,
    leaseExpirations: expirations,
    expenseMix: expenses,
    camExposure: cam
  };
}

export function calculateNoiSeries(monthly: MonthlyFinancialSnapshot[]) {
  return monthly.map((snapshot) => ({
    label: snapshot.month,
    value: snapshot.grossRent + snapshot.recoveries - snapshot.operatingExpenses
  }));
}

export function calculateRentSeries(monthly: MonthlyFinancialSnapshot[]) {
  return monthly.map((snapshot) => ({
    label: snapshot.month,
    value: snapshot.grossRent
  }));
}

export function calculateOccupancySeries(monthly: MonthlyFinancialSnapshot[]) {
  return monthly.map((snapshot) => ({
    label: snapshot.month,
    value: snapshot.occupancyRate * 100
  }));
}

