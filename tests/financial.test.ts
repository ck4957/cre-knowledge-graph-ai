import { describe, expect, it } from "vitest";
import { buildFinancialDashboard, calculateNoiSeries, calculateOccupancySeries } from "@/lib/financial/analytics";

describe("financial analytics", () => {
  it("calculates KPI values from the latest monthly snapshot", () => {
    const dashboard = buildFinancialDashboard({
      monthly: [
        {
          month: "Jun",
          grossRent: 100,
          operatingExpenses: 40,
          recoveries: 10,
          occupancyRate: 0.95,
          delinquencyRate: 0.02
        }
      ]
    });

    expect(dashboard.kpis.netOperatingIncome).toBe(70);
    expect(dashboard.kpis.expenseRatio).toBe(0.4);
    expect(dashboard.kpis.recoveryRatio).toBe(0.25);
  });

  it("builds chart-ready NOI and occupancy series", () => {
    const monthly = [
      { month: "Jan", grossRent: 100, operatingExpenses: 40, recoveries: 10, occupancyRate: 0.9, delinquencyRate: 0.01 },
      { month: "Feb", grossRent: 120, operatingExpenses: 42, recoveries: 12, occupancyRate: 0.92, delinquencyRate: 0.01 }
    ];

    expect(calculateNoiSeries(monthly)).toEqual([
      { label: "Jan", value: 70 },
      { label: "Feb", value: 90 }
    ]);
    expect(calculateOccupancySeries(monthly)[1]).toEqual({ label: "Feb", value: 92 });
  });
});

