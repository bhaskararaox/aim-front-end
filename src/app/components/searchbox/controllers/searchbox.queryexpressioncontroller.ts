import {Query} from "../models/searchbox.query";
import {RuleSet, Rule} from "../models/searchbox.ruleset";

export class QueryExpressionController {
  private _aimpactQuery: Query;
  public rules: Rule[];
  private _queryType: string;
  public _queryExpression: string;
  public isValid: boolean;
  public errorMessage: string;

  constructor() {
    this.rules = [];
    this._queryType = "All";
    this._queryExpression = "";
    this.isValid = true;
    this.errorMessage = "";
  }

  get queryExpression(): string {
    return this._queryExpression;
  }

  set queryExpression(value: string) {
    this._queryExpression = value;
    this.updateQueryExpression(value);
  }

  get queryType(): string {
    return this._queryType;
  }

  set queryType(type: string) {
    this._queryType = type;
    this.defineQueryType();
  }

  public initialize(query: Query) {
    this.isValid = true;
    this.errorMessage = "";
    this._aimpactQuery = query;
    this.loadRules();
    this.determineQueryType();
  }

  public findRuleByName(ruleId: string) {
    for (let rule of this.rules) {
      if ("R" + rule.id == ruleId) {
        return rule;
      }
    }
    return null;
  }

  public findRuleById(ruleId: number) {
    for (let rule of this.rules) {
      if (rule.id == ruleId) {
        return rule;
      }
    }
    return null;
  }

  private updateQueryExpression(customExpression: string) {
   let expression: string = customExpression.trim().toUpperCase();
   if(expression.trim().endsWith("OR") || expression.trim().endsWith("OR )") || expression.trim().endsWith("OR)")
         || expression.trim().endsWith("AND") || expression.trim().endsWith("AND )") || expression.trim().endsWith("AND)")) {
       this.errorMessage = "Invalid expression: Add a rule after the operartor / remove the operartor";
    }
    else{
      this.isValid = true;
      this.errorMessage = "";
      let expectingCondition: boolean = false;
      let expressionParts: string[] = expression.split(" ");

    let usedRuleIds: number[] = [];
    let currentRuleSet: RuleSet = null;
    let ruleSetStack: RuleSet[] = [];

    for (let expressionPart of expressionParts) {
      if (expectingCondition) {
        let condition = expressionPart.toLowerCase();
        if (condition == "and" || condition == "or") {
          if (currentRuleSet.condition == "TBD") {
            currentRuleSet.condition = condition;
          }
          else if (condition != currentRuleSet.condition) {
            let ruleSet = currentRuleSet;
            currentRuleSet = {condition: condition, rules: [ruleSet]};
            if (ruleSetStack.includes(ruleSet)){
              ruleSetStack.pop();
              ruleSetStack.push(currentRuleSet);
            }
          }
          expectingCondition = false;
        }
        else if (expressionPart != ")") {
          this.isValid = false;
          this.errorMessage = "Error! Expected AND/OR condition but found: " + expressionPart;
          break;
        }
      }
      else {
        while (expressionPart.startsWith("(")) {
          expressionPart = expressionPart.substring(1);
          let ruleSet = currentRuleSet;
          currentRuleSet = {condition: "TBD", rules: []};
          if (ruleSet != null) {
            ruleSet.rules.push(currentRuleSet);
            ruleSetStack.push(ruleSet);
          } else {
            ruleSetStack.push(currentRuleSet);
          }
        }

        if (expressionPart.toUpperCase().startsWith("R")) {
          let ruleId = expressionPart.toUpperCase();
          while (ruleId.endsWith(")")) {
            ruleId = ruleId.substring(0, ruleId.length - 1);
          }
          let rule = this.findRuleByName(ruleId);
          if (rule == null) {
            this.isValid = false;
            this.errorMessage = "Error! Invalid condition id (R#): " + ruleId;
            break;
          } else if (usedRuleIds.includes(rule.id)) {
            this.isValid = false;
            this.errorMessage = "Error! Conditions id can only be used once in expression. Id: "
              + ruleId + " was used more than once";
            break;
          }
          if (currentRuleSet == null) {
            currentRuleSet = {condition: "TBD", rules: []};
          }
          currentRuleSet.rules.push(rule);
          usedRuleIds.push(rule.id);
        }
        else {
          this.isValid = false;
          this.errorMessage = "Error! Expected condition id (R#) but found: " + expressionPart;
          break;
        }
        expectingCondition = true;
      }
      while (expressionPart.endsWith(")")) {
        expressionPart = expressionPart.substring(0, expressionPart.length - 1);
        if (ruleSetStack.length == 0) {
          this.isValid = false;
          this.errorMessage = "Error! Too many closing parenthesis on defined expression";
        } else {
          currentRuleSet = ruleSetStack.pop();
        }
      }
    }
    if (this.isValid) {
      if (ruleSetStack.length != 0) {
        this.isValid = false;
        this.errorMessage = "Error! Missing closing parenthesis on defined expression";
      } else {
        if (currentRuleSet.condition == "TBD") {
          currentRuleSet.condition = "and";
        }
        this.optimizeRuleSet(currentRuleSet);
        this._aimpactQuery.query = currentRuleSet;
      }
    }
  }
}

  private optimizeRuleSet(query: RuleSet) {
    for (let i: number = 0; i < query.rules.length; i++) {
      let rule = query.rules[i];
      if ('condition' in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        if (ruleSet.condition.length <= 1 || ruleSet.condition == "TBD") {
          query.rules = query.rules.slice(0, i).concat(ruleSet.rules).concat(query.rules.slice(i + 1));
          i = 0;
        }
      }
    }

    for (let rule of query.rules) {
      if ('condition' in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        this.optimizeRuleSet(ruleSet);
      }
    }
  }

  private determineQueryType() {
    this.fixQueryIds();
    let isComplexQuery: boolean = false;
    for (let rule of this._aimpactQuery.query.rules) {
      if ('condition' in rule) {
        isComplexQuery = true;
        break;
      }
    }
    if (isComplexQuery) {
      this._queryType = "Custom";
      this.constructQueryExpression();
    }
    else if (this._aimpactQuery.query.condition.toLowerCase() == "or") {
      this._queryType = "Any";
      this._queryExpression = "";
      this.errorMessage = "";
      this.isValid = true;
    }
    else {
      this._queryType = "All";
      this._queryExpression = "";
      this.errorMessage = "";
      this.isValid = true;
    }
  }

  private defineQueryType() {
    this.fixQueryIds();
    let rules: RuleSet | Rule[] = [];
    for (let rule of this.rules){
      rules.push(rule);
    }
    if (this._queryType == "Custom") {
      this.constructQueryExpression();
    }
    else if (this._queryType == "Any") {
      this._queryExpression = "";
      this.errorMessage = "";
      this.isValid = true;
      this._aimpactQuery.query = {condition: "or", rules: rules};
    }
    else  if (this._queryType == "All") {
      this._queryExpression = "";
      this.errorMessage = "";
      this.isValid = true;
      this._aimpactQuery.query = {condition: "and", rules: rules};
    }
  }

  private loadRules() {
    let rules = this.getAllRules(<RuleSet>this._aimpactQuery.query);
    this.rules = rules;
  }

  private getAllRules(query: RuleSet = null): Rule[] {
    let results: Rule[] = [];
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        results = results.concat(this.getAllRules(ruleSet));
      }
      else if ("field" in rule) {
        results.push(<Rule>rule);
      }
    }
    return results;
  }

  public addRule(rule: Rule) {
    this.rules.push(rule);
    this.defineQueryType();
  }

  public removeRule(ruleId: number) {
    for (let i: number = 0; i < this.rules.length; i++) {
      let rule = this.rules[i];
      if (rule.id == ruleId) {
        this.rules = this.rules.slice(0, i).concat(this.rules.slice(i + 1));
        break;
      }
    }
    this.defineQueryType();
  }

  private constructQueryExpression() {
    this._queryExpression = this.toQueryExpression();
    this.isValid = true;
    this.errorMessage = "";
  }

  public fixQueryIds() {
    let ids: number[] = [];
    let rules = this.rules;
    for (let rule of rules) {
      if ("id" in rule) {
        ids.push(rule.id);
      }
    }
    for (let rule of rules) {
      if (!("id" in rule)) {
        let idSet: boolean = false;
        for (let i: number = 0; i < ids.length; i++) {
          if (!ids.includes(i)) {
            rule.id = i;
            idSet = true;
            ids.push(i);
            break;
          }
        }
        if (!idSet) {
          rule.id = ids.length;
          ids.push(rule.id);
        }
      }
    }
  }

  private toQueryExpression(query = null): string {
    if (query == null) {
      query = this._aimpactQuery.query;
    }
    let condition: string = query.condition;
    let parts: string[] = [];

    for (let rule of query.rules) {
      if ("condition" in rule) {
        parts.push(this.toQueryExpression(rule));
      } else if ("field" in rule) {
        parts.push("R" + rule.id);
      }
    }
    if (parts.length == 0) {
      return "";
    }
    else if (parts.length == 1) {
      return parts[0];
    }
    else {
      return "(" + parts.join(" " + condition.toUpperCase() + " ") + ")";
    }
  }
}
