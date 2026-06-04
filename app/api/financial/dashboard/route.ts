import { NextResponse } from "next/server";
import { buildFinancialDashboard } from "@/lib/financial/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildFinancialDashboard());
}

