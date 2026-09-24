export const KNOWN_OPERATORS = [
  'isEqualTo',
  'isNotEqualTo',
  'isGreaterThan',
  'isGreaterOrEqual',
  'isLessThan',
  'isLessOrEqual',
  'isBetween',
];

export function stringifyConditionValue(value: any): string {
  return Array.isArray(value) ? value.join(',') : String(value);
}

export function parseConditionValue(raw: string, operator: string): any {
  if (operator === 'isBetween') {
    const parts = raw.split(',').map((p) => Number(p.trim()));
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
      return parts;
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
