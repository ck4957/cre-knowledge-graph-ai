export type TemporalFact = {
  validFrom?: string;
  validTo?: string;
};

export function isActive(fact: TemporalFact, asOf = new Date()): boolean {
  const from = fact.validFrom ? startOfDay(new Date(fact.validFrom)) : undefined;
  const to = fact.validTo ? endOfDay(new Date(fact.validTo)) : undefined;
  const target = asOf.getTime();

  if (from && target < from.getTime()) {
    return false;
  }

  if (to && target > to.getTime()) {
    return false;
  }

  return true;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

