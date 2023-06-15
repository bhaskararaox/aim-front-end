export class RuleSet {
  condition: string;
  rules: Array<RuleSet | Rule>;
}
export class Rule {
  id?: number;
  field?: string;
  value?: any;
  values?: any[];
  operator?: string;
}
