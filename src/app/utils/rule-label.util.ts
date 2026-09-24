function describeCondition(cond: any): string {
  const { fact, operator, value } = cond || {};
  const valueStr = Array.isArray(value) ? value.join(',') : String(value);
  return `${fact}-${operator}-${valueStr}`;
}

function describeConditions(conditions: any): string | null {
  if (!conditions) {
    return null;
  }
  const joiner = conditions.all ? '_and_' : conditions.any ? '_or_' : null;
  const entries = conditions.all || conditions.any;
  if (!joiner || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  if (!entries.every((entry: any) => entry && 'fact' in entry && 'operator' in entry)) {
    return null;
  }
  return entries.map(describeCondition).join(joiner);
}

function buildRuleLabel(rule: any, index: number): string {
  const conditionLabel = describeConditions(rule?.conditions) ?? `rule-${index}`;
  const eventType = rule?.event?.type;
  return eventType ? `${conditionLabel} → ${eventType}` : conditionLabel;
}

export function toLabeledRules(rules: any[]): Record<string, any> {
  const labeled: Record<string, any> = {};
  (rules || []).forEach((rule, index) => {
    let label = buildRuleLabel(rule, index);
    let suffix = 2;
    while (Object.prototype.hasOwnProperty.call(labeled, label)) {
      label = `${buildRuleLabel(rule, index)} (${suffix})`;
      suffix++;
    }
    labeled[label] = rule;
  });
  return labeled;
}
