import {QueryAttributeValues} from "./searchbox.queryattributevalues";
//import {RuleSet, Rule} from "angular2-query-builder/dist/components/query-builder/query-builder.interfaces";
import {TraceAttribute} from "../../../models/app.traceattribute";
import {AvailableField} from "./searchbox.availablefield";
import {QueryOperator} from "./searchbox.queryoperator";
import {NameValue} from "../../../models/app.namevalue";
import {SearchBoxComponent} from "../searchbox.component";
import {SearchboxQueryErrorMessages} from "./searchbox.queryErrorMessages";
import {Rule, RuleSet} from "./searchbox.ruleset";
import {Field} from "./searchbox.field";
import {isUndefined} from "util";

export class Query {
  public static DefaultKeikoConfigurationValue = "default";
  private static readonly INPUT_ID_TYPE_INITIAL_NAME = "T";
  private static readonly INPUT_ID_VALUE_INITIAL_NAME = "V";
  private static readonly SEARCH_BOX_ALERT_ID = "searchBoxAlert";
  private static readonly CATEGORY_TYPE_NODE = "P-AUTOCOMPLETE";
  public id: number;
  public query: RuleSet;
  private queryOperator: QueryOperator;
  private _keikoConfiguration: string;
  public shareId: string;

  constructor(query: RuleSet = null, keikoConfiguration = Query.DefaultKeikoConfigurationValue, id = null, shareId = null) {
    this.query = query;
    this.queryOperator = QueryOperator.getInstance();
    if (this.query == null) {
      this.clearQuery();
    }
    this.keikoConfiguration = keikoConfiguration;
    this.id = id;
    this.shareId = shareId;
  }

  public addRule(rule: Rule) {
    this.query.rules.push(rule);
  }

  private getAllRules(query: RuleSet = null): any[] {
    if (query == null) {
      query = this.query;
    }

    let results = [];
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        results = results.concat(this.getAllRules(ruleSet));
      } else if ("field" in rule) {
        results.push(rule);
      }
    }
    return results;
  }

  public fixQueryIds() {
    let ids: number[] = [];
    let rules = this.getAllRules();
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

  public removeRule(ruleId: number) {
    this._removeRule(ruleId, this.query);
  }

  private _removeRule(ruleId: number, query: RuleSet) {
    for (let i: number = 0; i < query.rules.length; i++) {
      let rule = query.rules[i];
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        this._removeRule(ruleId, ruleSet);
      } else if ("field" in rule) {
        let field = <any>rule;
        if (field.id == ruleId) {
          query.rules = query.rules.slice(0, i).concat(query.rules.slice(i + 1));
        }
      }
    }
  }

  public clearQuery() {
    this.query = {
      condition: "and",
      rules: [
        {field: "trace", operator: "Contains", value: ""}
      ]
    };
    let rule = <any>this.query.rules[0];
    rule.id = 0;
  }

  set keikoConfiguration(configuration: string) {
    this._keikoConfiguration = configuration;
  }


  /**
   * TRACING-1617
   * This method validate that the date is inside the valida limits
   * return values:
   * 1 = The date is under the earliest date limit 'Jan - 2000'"
   * 2 = The date is over the maximum limit '(current month + 1 and current year)'"
   * @param today
   * @param month
   * @param year
   * @param mlist
   * @param condition
   */
  public validateDateLimits(today: Date, month: number, year: number, condition: string): number {
    const datePart = condition.match(/[0-9]*-[0-9][0-9]/gi);
    if (datePart != null) {
      const dateSplit = datePart[0].split("-");
      if (parseInt(dateSplit[0]) < 2000) {
        return 1;
      } else if (parseInt(dateSplit[0]) > year || (parseInt(dateSplit[0]) >= year && parseInt(dateSplit[1]) > month + 1)) {
        return 2;
      }
    }
    return 0;
  }


  private validateDate(queryString: string): string {
    var query = queryString.toLowerCase();
    var mlist = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date();
    var month = today.getMonth();
    var year = today.getFullYear();
    var separators = ["and", "or"];
    let queryConditionArray: string[] = query.split(new RegExp(separators.join("|"), "g"));

    for (var condition of queryConditionArray) {
      if (condition.includes("date")) {
        const errorType = this.validateDateLimits(today, month, year, condition);
        if (errorType === 1) {
          return "Enter a date after Jan - 2000"
        } else if (errorType === 2) {
          return "Enter a date before " + mlist[month + 1] + " - " + year;
        }
      }
    }
    return "";
  }


  /**
   * TRACING-1617
   * @param queryString
   */
  public isValidNumberOfThreads(queryString: string): boolean {
    if ((!this.validateNumberOfThreads(queryString, "number of threads", "num_cpus", "equals", "==")) ||
      (!this.validateNumberOfThreads(queryString, "number of threads", "num_cpus", "greater_equal_than", ">=")) ||
      (!this.validateNumberOfThreads(queryString, "number of threads", "num_cpus", "less_equal_than", "<=")) ||
      (!this.validateNumberOfThreads(queryString, "number of threads", "num_cpus", "less_than", "<")) ||
      (!this.validateNumberOfThreads(queryString, "number of threads", "num_cpus", "greater_than", ">"))) {
      this.setErrorStyles(QueryAttributeValues.NUM_CPUS, false);
      return false;
    }
    return true;
  }


  private validateNumberOfThreads(queryString: string, term1: string, term2: string, operator1: string, operator2: string): boolean {
    let queryConditionArray: string[] = queryString.toLowerCase().split("and");
    if (queryConditionArray.length == 0) {
      queryConditionArray = queryString.toLowerCase().split("or");
    }
    if ((queryConditionArray.length == 1) && (queryConditionArray[0].includes("or"))) {
      queryConditionArray = queryConditionArray[0].split("or");
    }
    for (var condition of queryConditionArray) {
      if ((condition.toLowerCase().includes(term1)) || (condition.toLowerCase().includes(term2))) {
        let numberOfThreadsPart1 = condition.toLowerCase().split(operator1);
        let numberOfThreadsPart2 = condition.toLowerCase().split(operator2);
        if (numberOfThreadsPart1.length == 2) {
          let numberOfThreadsValuesPart = numberOfThreadsPart1[1].toLowerCase().split(",");
          if (numberOfThreadsValuesPart.length > 1) {
            return false;
          }
        } else if (numberOfThreadsPart2.length == 2) {
          let numberOfThreadsValuesPart = numberOfThreadsPart2[1].toLowerCase().split(",");
          if (numberOfThreadsValuesPart.length > 1) {
            return false;
          }
        }
      }
    }
    return true;
  }


  public isValid(query: RuleSet = null): boolean {
    if (Field.autoCompleteValidator != "") {
      return false;
    }

    let result: boolean = true;
    if (query == null) {
      query = this.query;
    }
    var queryString: string = this.toStringRulset(query, []);
    if (query.rules.length == 0) {
      result = false;
    }
    if (queryString.includes("date") && this.validateDate(queryString).length > 0) {
      result = false;
    } else if (((queryString.includes("num_cpus")) || (queryString.includes("number of threads"))) &&
      (!this.isValidNumberOfThreads(queryString)) ) {
      result = false;
    }
    else if (queryString.includes("isaPercentage") && this.validateISACondition(queryString).length > 0) {
      result = false;
    }
    else {
      for (let rule of query.rules) {
        if ("condition" in rule) {
          let ruleSet: RuleSet = <RuleSet>rule;
          result = result && this.isValid(ruleSet);
        } else if ("field" in rule) {
          let fieldRule: Rule = <Rule>rule;
          if (fieldRule.value == null || fieldRule.value == "") {
            result = false;
            break;
          }
        }
      }
    }
    return result;
  }

  public isRuleUsed(ruleId: number, query: RuleSet = null): boolean {
    if (query == null) {
      query = this.query;
    }
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        let result = this.isRuleUsed(ruleId, ruleSet);
        if (result) {
          return result;
        }
      } else if ("field" in rule) {
        let fieldRule = <any>rule;
        if (fieldRule.id == ruleId) {
          return true;
        }
      }
    }
    return false;
  }

  private getQueryIncludes(query: RuleSet): string[] {
    let result: string[] = [];
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        let additionalIncludes: string[] = this.getQueryIncludes(ruleSet);
        for (let additionalInclude of additionalIncludes) {
          if (!result.includes(additionalInclude)) {
            result.push(additionalInclude);
          }
        }
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        this.addInclude(fieldRule.field, result);
      }
    }
    return result;
  }

  private addInclude(fieldName: string, result: string[]) {
    const performanceSimulationMetricsValues = ["keiko_cpi", "keiko_l1mpi", "keiko_l2mpi", "keiko_llcmpi"];
    const keikoMetricsValues = ["keiko_icache_miss", "keiko_jeclear"];

    if (fieldName.includes("invalidfields") && !result.includes("invalidFields")) {
      result.push("invalidFields");
    }

    if (fieldName.includes("ispublished") && !result.includes("isPublished")) {
      result.push("isPublished");
    }

    if (fieldName.includes("ispreproduction") && !result.includes("isPreproduction")) {
      result.push("isPreproduction");
    }

    if (fieldName.includes("isa") && !result.includes("isaExtensions")) {
      result.push("isaExtensions");
    }

    if (fieldName.includes("isaset") && !result.includes("isaSets")) {
      result.push("isaSets");
    }

    if (fieldName.includes("category") && !result.includes("Categories")) {
      result.push("Categories");
    }

    if (fieldName.includes("iform") && !result.includes("iForms")) {
      result.push("iForms");
    }

    if (fieldName.includes("isaPercentage") && !result.includes("isaPercentage")) {
      result.push("isaPercentage");
    }

    if (fieldName.includes("emon") && !result.includes("emonMetrics") && (fieldName != "edp_emon")) {
      result.push("emonMetrics");
    }

    if (fieldName.includes("func") && !result.includes("funcMetrics")) {
      result.push("funcMetrics");
    }

    if (fieldName == QueryAttributeValues.STUDY_LIST && !result.includes("studyLists")) {
      result.push("studyLists");
    }

    if (fieldName == QueryAttributeValues.TRACE_LIST && !result.includes("traceLists")) {
      result.push("traceLists");
    }

    if (performanceSimulationMetricsValues.includes(fieldName) && !result.includes("keikoMetrics")) {
      result.push("keikoMetrics");
    }

    if (keikoMetricsValues.includes(fieldName) && !result.includes("keikoStats")) {
      result.push("keikoStats");
    }

    if ((fieldName == "edp_emon") && (!result.includes("emonData"))) {
      result.push("emonData");
    }

    if (((fieldName == "cr3shareddata") || (fieldName == "iscr3sharedamongthreads"))
      && (!result.includes("cr3SharedData"))) {
      result.push("cr3SharedData");
    }

    if (((fieldName == "lockinstructions") || (fieldName == "haslockinstructions"))
      && (!result.includes("lockInstructions"))) {
      result.push("lockInstructions");
    }

    if (((fieldName == "lcatdata") || (fieldName == "lcatimpact"))
      && (!result.includes("lcatData"))) {
      result.push("lcatData");
    }
  }

  private replaceOperator(query: RuleSet) {
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        this.replaceOperator(ruleSet);
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        this.replaceOperatorHelper(fieldRule);
      }
    }
  }

  private replaceOperatorHelper(rule: Rule) {
    switch (rule.operator) {
      case "Contains":
        rule.operator = "contains";
        break;
      case "Not Contains":
        rule.operator = "not_contains";
        break;
      case  "Matches":
        rule.operator = "matches";
        break;
      case "Sequence":
        rule.operator = "sequence";
        break;
      case "==":
        rule.operator = "equals";
        break;
      case "In":
        rule.operator = "in";
        break;
      case "Not In":
        rule.operator = "not_in";
        break;
      case ">":
        rule.operator = "greater_than";
        break;
      case ">=":
        rule.operator = "greater_equal_than";
        break;
      case "<":
        rule.operator = "less_than";
        break;
      case "<=":
        rule.operator = "less_equal_than";
        break;
    }
  }

  public fixOperators(query: RuleSet = null) {
    if (query == null) {
      query = this.query;
    }
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        this.fixOperators(ruleSet);
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        this.fixOperatorsHelper(fieldRule);
      }
    }
  }

  private fixOperatorsHelper(rule: Rule) {
    switch (rule.operator) {
      case "contains":
        rule.operator = "Contains";
        break;
      case "not_contains":
        rule.operator = "Not Contains";
        break;
      case  "matches":
        rule.operator = "Matches";
        break;
      case "sequence":
        rule.operator = "Sequence";
        break;
      case "=":
      case "equals":
        rule.operator = "==";
        break;
      case "greater_than":
        rule.operator = ">";
        break;
      case "greater_equal_than":
        rule.operator = ">=";
        break;
      case "less_than":
        rule.operator = "<";
        break;
      case "less_equal_than":
        rule.operator = "<=";
        break;
      case "in":
        rule.operator = "In";
        break;
      case "not_in":
        rule.operator = "Not In";
        break;
    }
  }

  public getSequenceConditionValue(query: RuleSet = null): string {
    if (query == null) {
      query = this.query;
    }
    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        let field: string = this.getSequenceConditionValue(ruleSet);
        if (field != "") {
          return field;
        }
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        if (fieldRule.field == QueryAttributeValues.INSTRUCTION) {
          return fieldRule.value;
        }
      }
    }
    return "";
  }

  public toQueryWithTransformedOperators(): Query {
    let query: RuleSet = JSON.parse(JSON.stringify(this.query)); //create a clone of current query object
    this.replaceOperator(query);
    return new Query(query, this.keikoConfiguration);
  }

  public toSearchableQuery(traceAttributes: TraceAttribute[]) {
    let query = JSON.parse(JSON.stringify(this.query)); //create a clone of current query object
    this.replaceOperator(query);
    let includes: string[] = this.getQueryIncludes(this.query);
    for (let traceAttribute of traceAttributes) {
      this.addInclude(traceAttribute.value, includes);
    }

    return {
      conditions: [query],
      includes: includes,
      keikoConfiguration: this.keikoConfiguration
    };
  }

  public toString(fields: AvailableField[] = []): string {
    if (!this.isValid()) {
      if (this.query.rules.length <= 1) {
        return "";
      } else {
        return "Invalid Query! Contains empty values set on fields";
      }
    }

    return this.toStringRulset(this.query, fields);
  }

  private validateISACondition(queryString: string): string {
    let isaCount: number = 0;
    let isaOperators: NameValue[] = this.queryOperator.getOperators(new TraceAttribute("ISA", "isa"));
    for (let isaOperator of isaOperators) {
      if (queryString.toLowerCase().includes("isa " + isaOperator.name.toLowerCase()) ||
        queryString.toLowerCase().includes("isa " + isaOperator.value)) {
        ++isaCount;
        if (isaCount > 1 || !this.isExistingISAConditionValid(queryString.toLowerCase(), isaOperator)) {
          return "Multiple ISA"
        }
      }
    }
    if (isaCount == 0) {
      return "ISA Not Exists";
    }
    return "";
  }

  private isExistingISAConditionValid(queryString: string, isaOperator: NameValue): boolean {
    let operatorName: string = isaOperator.name.toLowerCase();
    let operatorValue: string = isaOperator.value.toLowerCase();
    let queryConditionArray: string[] = queryString.toLowerCase().split("and");
    for (var condition of queryConditionArray) {
      if (condition.includes("isa " + operatorName) || condition.includes("isa " + operatorValue)) {
        var startingPosition = queryString.toLowerCase().search("isa " + operatorName.toLowerCase());
        if (startingPosition == 0) {
          startingPosition = queryString.search("isa " + operatorValue);
        }
        var alternatePosition = queryString.lastIndexOf("isa " + operatorName);
        if (alternatePosition == 0) {
          alternatePosition = queryString.lastIndexOf("isa " + operatorValue);
        }
        if (startingPosition != alternatePosition) {
          return false;
        }
        else {
          let isaNames: string[] = null;
          if (condition.includes("isa " + operatorName)) {
            isaNames = condition.replace("isa " + operatorName, "").split(",");
          }
          else if (condition.includes("isa " + operatorName)) {
            isaNames = condition.replace("isa " + operatorValue, "").split(",");
          }
          if (isaNames != null && isaNames.length > 1) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /********************************************************************************************************************
   * TRACING-1457
   * This method is to identify which type of filter needs a different approach to set the error css style
   * @param trace
   *******************************************************************************************************************/
  public isTraceAutomplete(trace: string): boolean {
    return trace === QueryAttributeValues.INSTRUCTION ||
      trace === QueryAttributeValues.ISA ||
      trace === QueryAttributeValues.ISA_SET ||
      trace === QueryAttributeValues.IFORM ||
      trace === QueryAttributeValues.CATEGORY ||
      trace === QueryAttributeValues.TAGS ||
      trace === QueryAttributeValues.CLASSIFICATION ||
      trace === QueryAttributeValues.STUDY_LIST ||
      trace === QueryAttributeValues.TRACE_LIST ||
      trace === QueryAttributeValues.NUM_CPUS ||
      trace === QueryAttributeValues.APPLICATION ||
      trace === QueryAttributeValues.OPERATION_SYSTEM ||
      trace === QueryAttributeValues.COMPILER;
  }

  /********************************************************************************************************************
   * TRACING-1457 & TRACING-1601
   * This method is to check if the value contains an error message
   * @param value
   *******************************************************************************************************************/
  private containsAnyError(value): boolean {
    return value === SearchboxQueryErrorMessages.QUERY_DATE_ERROR_MESSAGE ||
      value === SearchboxQueryErrorMessages.QUERY_NUMBER_OF_THREADS_ONLY_ONE_VALUE_ERROR_MESSAGE ||
      value === SearchboxQueryErrorMessages.QUERY_ISA_PERCENTAGE_FILTER_AND_CONDITION_ERROR_MESSAGE ||
      value === SearchboxQueryErrorMessages.QUERY_ISA_PERCENTAGE_FILTER_ISA_FILTER_ERROR_MESSAGE ||
      value === SearchboxQueryErrorMessages.QUERY_ISA_ONLY_ONE_ERROR_MESSAGE ||
      value.includes(SearchboxQueryErrorMessages.QUERY_DATE_ERROR_MESSAGE) ||
      value === SearchboxQueryErrorMessages.QUERY_CONTAINS_EMPTY_VALUES_ERROR_MESSAGE;
  }


  /********************************************************************************************************************
   * TRACING-1457
   * This method is to remove the CSS error style to the node sent by parameter
   * @param node
   *******************************************************************************************************************/
  public removeErrorStyle(node: Element) {
    if (node) {
      node.classList.remove("error");
    }
  }

  /**
   * ******************************************************************************************************************
   * TRACING-1457
   * This method is to add the CSS error style to the node sent by parameter
   * @param node
   *******************************************************************************************************************/
  public addErrorStyle(node: Element) {
    if (node) {
      node.classList.add("error");
    }
  }

  /**
   * TRACING-1457
   * This method iterates by the rules tree and convert that to an array for easier finding of the rules
   * @param rules
   */
  public getRules(rules: any): Rule[] {
    let newRules: Rule[] = [];
    for (let rule of rules) {
      let ruleSet = <RuleSet>rule;
      if (ruleSet.rules) {
        newRules = this.getRules(ruleSet.rules);
      } else {
        newRules.push(<Rule>rule);
      }
    }
    return newRules;
  }


  /**
   * * ****************************************************************************************************************
   * TRACING-1457
   * This function is used to find the DOM control for the specific rule and returned
   * @param identifier
   *******************************************************************************************************************/
  public findRule(identifier: string): Rule {
    let rules = this.getRules(this.query.rules);
    let ruleId = identifier.substring(1);
    for (let queryRule of rules) {
      let rule = <Rule>queryRule;
      if (rule.id.toString() === ruleId) {
        return rule;
      }
    }
    return "";
  }


  /********************************************************************************************************************
   * TRACING-1457
   * This method is to clear all the rules error css styles
   *******************************************************************************************************************/
  public clearErrorStyles() {
    // Clear error style for search box alert
    this.removeErrorStyle(document.getElementById(Query.SEARCH_BOX_ALERT_ID));
    // Get all filters DOM elements
    let typeFilters = document.querySelectorAll("*[id^=" + Query.INPUT_ID_TYPE_INITIAL_NAME + "]");
    let valueFilters = document.querySelectorAll("*[id^=" + Query.INPUT_ID_VALUE_INITIAL_NAME + "]");
    for (let i = 0; i < typeFilters.length; i++) {
      let nodeTypeValue = this.findRule(typeFilters.item(i).id).field;
      if (!nodeTypeValue) {
        continue;
      }
      let nodeValue = valueFilters.item(i);
      if (nodeTypeValue === QueryAttributeValues.SEGMENT) {
        let valueFiltersTmp = document.querySelectorAll("*[id^=" + nodeValue.id + "]");
        if (valueFiltersTmp.length > 1) {
          nodeValue = valueFiltersTmp.item(1);
        }
        this.removeErrorStyle(nodeValue.children[0]);
      } else if (this.isTraceAutomplete(nodeTypeValue)) {
        if (nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) {
          this.removeErrorStyle(nodeValue.children[0].children[0]);
        } else {
          this.removeErrorStyle(nodeValue);
        }
      } else {
        this.removeErrorStyle(nodeValue);
      }
    }
  }


  /**
   * TRACING-1617
   * This method validate the date and number of threads fields
   * @param fieldValue
   * @param fieldValues
   * @param fieldAlias1
   */
  public validateField(fieldValue: string, fieldValues: string[], fieldAlias1: string): boolean {
    if (fieldAlias1.includes(QueryAttributeValues.DATE)) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      const errorType = this.validateDateLimits(today, month, year, fieldValue);
      if (errorType !== 0) {
        return false;
      }
    }
    // Checks Number of Threads
    if ( ((fieldAlias1.includes("number of threads")) || (fieldAlias1.includes(QueryAttributeValues.NUM_CPUS))) && (fieldValues.length > 1) ) {
        return false;
    }
    return true;
  }


  /**
   * TRACING-1617
   * This function iterates through the rules array and check if the rule is the one we are looking for and if so then
   * try to validate the field accordingly. This function return the invalid fields IDs
   * @param fieldAlias1
   */
  public findInvalidField(fieldAlias1: string) {
    let invalidFieldIds = "";
    let rules = this.getRules(this.query.rules);
    for (let queryRule of rules) {
      let rule = <Rule>queryRule;
      if (rule.field.includes(fieldAlias1)) {
        if (!this.validateField(rule.value, rule.values, fieldAlias1)) {
          invalidFieldIds = invalidFieldIds + " " + rule.id;
        }
      }
    }
    return invalidFieldIds;
  }

  /**
   * TRACING-1617
   * This method call the findInvalidField method for dates and number of threads accordingly
   * @param attributeType
   */
  public getInvalidFields(attributeType: string): string {
    if ((attributeType === QueryAttributeValues.DATE) ||
      (attributeType === QueryAttributeValues.NUM_CPUS)) {
      switch (attributeType) {
        case QueryAttributeValues.DATE: {
          return this.findInvalidField(QueryAttributeValues.DATE);
        }
        case QueryAttributeValues.NUM_CPUS: {
          return this.findInvalidField(QueryAttributeValues.NUM_CPUS);
        }
        default: {
          return "";
        }
      }
    }
  }

  // TODO: is this valid? Segment is not an autocomplete control
  public addStyleAutoCompleteValidation() {
    this.setErrorStyles(QueryAttributeValues.SEGMENT, false);
  }


  /**
   * TRACING-1457
   * This method set the error styles when checking emptiness of the fields
   * @param nodeValueStr
   * @param nodeTypeValue
   * @param nodeValue
   */
  public setErrorStylesCheckEmptiness(nodeValueStr: string, nodeTypeValue: string, nodeValue: Element) {
    if (nodeValueStr === "") {
      // Checks Segment - Dropdown control
      if (nodeTypeValue === QueryAttributeValues.SEGMENT) {
        const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]"); // In both: if & else
        if (valueFiltersTmp.length > 1) {
          nodeValue = valueFiltersTmp.item(1);
        }
        this.addErrorStyle(nodeValue.children[0]);
      } else if (this.isTraceAutomplete(nodeTypeValue)) { // Checks Autocomplete Fields
        const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]"); // In both: if & else
        for (let j = 0; j < valueFiltersTmp.length; j++) {
          nodeValueStr = this.findRule(nodeValue.id).value; // for future check
          if ((nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) && (nodeValueStr === "")) {
            this.addErrorStyle(nodeValue.children[0].children[0]);
          } else if (nodeValueStr === "") {
            this.addErrorStyle(nodeValue);
          }
        }
      } else {
        this.addErrorStyle(nodeValue);
      }
    } else { // Removes error class if filter is not empty
      if (nodeTypeValue === QueryAttributeValues.SEGMENT) {
        const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
        if (valueFiltersTmp.length > 1) {
          nodeValue = valueFiltersTmp.item(1);
        }
        this.removeErrorStyle(nodeValue.children[0]);
      } else if (this.isTraceAutomplete(nodeTypeValue)) {
        const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
        for (let j = 0; j < valueFiltersTmp.length; j++) {
          if (nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) {
            this.removeErrorStyle(nodeValue.children[0].children[0]);
          } else {
            this.removeErrorStyle(nodeValue);
          }
        }
      } else {
        this.removeErrorStyle(nodeValue);
      }
    }
  }


  /**
   * TRACING-1457
   * This method set the error styles for the attribute type specified in the param
   * @param nodeTypeValue
   * @param nodeValue
   * @param invalidFieldIds
   */
  public setErrorStylesForAttributeType(nodeTypeValue: string, nodeValue: Element, invalidFieldIds: string) {
    if (nodeTypeValue === QueryAttributeValues.SEGMENT) {
      const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
      if (valueFiltersTmp.length > 1) {
        nodeValue = valueFiltersTmp.item(1);
      }
      this.addErrorStyle(nodeValue.children[0]);
    } else if (this.isTraceAutomplete(nodeTypeValue)) {
      const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
      for (let j = 0; j < valueFiltersTmp.length; j++) {
        nodeValue = valueFiltersTmp.item(j); // for future check
        const nodeValueField = this.findRule(valueFiltersTmp.item(j).id).field;
        if ((invalidFieldIds.trim() !== "") &&
          ((nodeValueField === QueryAttributeValues.DATE) ||
            (nodeValueField === QueryAttributeValues.NUM_CPUS))) {
          if (invalidFieldIds.includes(nodeValue.id.substring(1))) {
            if (nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) {
              this.addErrorStyle(nodeValue.children[0].children[0]);
            } else {
              this.addErrorStyle(nodeValue);
            }
          }
        } else {
          if (nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) {
            this.addErrorStyle(nodeValue.children[0].children[0]);
          } else {
            this.addErrorStyle(nodeValue);
          }
        }
      }
    } else {
      const nodeValueField = this.findRule(nodeValue.id).field;
      if ((invalidFieldIds.trim() !== "") && (nodeValueField === QueryAttributeValues.DATE)) {
        if (invalidFieldIds.includes(nodeValue.id.substring(1))) {
          this.addErrorStyle(nodeValue);
        }
      } else {
        this.addErrorStyle(nodeValue);
      }
    }
  }


  /********************************************************************************************************************
   * TRACING-1457
   * This method set the error css styles accordingly using the attribute type and the checkEmptiness flag to check
   * for input fields empty. Due tech block about query builder API the initial implementation might need further
   * change that could not being done due time constraint.
   * @param attributeType: the trace type that we are looking to set the error css style
   * @param checkEmptiness: flag to know we need to check for empty values
   *******************************************************************************************************************/
  public setErrorStyles(attributeType: string, checkEmptiness: boolean) {
    // Get all filters DOM elements
    const typeFilters = document.querySelectorAll("*[id^=" + Query.INPUT_ID_TYPE_INITIAL_NAME + "]");
    const valueFilters = document.querySelectorAll("*[id^=" + Query.INPUT_ID_VALUE_INITIAL_NAME + "]");

    // Clear all error styles
    this.clearErrorStyles();

    // Validates Date & Number of Threads
    let invalidFieldIds = "";
    if ((attributeType === QueryAttributeValues.DATE) ||
      (attributeType === QueryAttributeValues.NUM_CPUS)) {
      invalidFieldIds = this.getInvalidFields(attributeType);
    }

    // Set error style for search box alert
    this.addErrorStyle(document.getElementById(Query.SEARCH_BOX_ALERT_ID));
    // Iterate through all filters
    for (let i = 0; i < typeFilters.length; i++) {
      // Gets field
      const nodeTypeValue = this.findRule(typeFilters.item(i).id).field;
      if (!nodeTypeValue) {
        continue;
      }

      // Gets value
      let nodeValue = valueFilters.item(i);
      let nodeValueStr = this.findRule(nodeValue.id).value;

      if (checkEmptiness) {
        this.setErrorStylesCheckEmptiness(nodeValueStr, nodeTypeValue, nodeValue);
      } else if (attributeType.toLocaleLowerCase().includes(nodeTypeValue.toLocaleLowerCase())) {
        this.setErrorStylesForAttributeType(nodeTypeValue, nodeValue, invalidFieldIds);
      } else {  // cleaning where it does not apply
        if (nodeTypeValue === QueryAttributeValues.SEGMENT) {
          const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
          if (valueFiltersTmp.length > 1) {
            nodeValue = valueFiltersTmp.item(1);
          }
          this.removeErrorStyle(nodeValue.children[0]);
        } else if (this.isTraceAutomplete(nodeTypeValue)) {
          const valueFiltersTmp = document.querySelectorAll("*[id=" + nodeValue.id + "]");
          for (let j = 0; j < valueFiltersTmp.length; j++) {
            if (nodeValue.nodeName === Query.CATEGORY_TYPE_NODE) {
              this.removeErrorStyle(nodeValue.children[0].children[0]);
            } else {
              this.removeErrorStyle(nodeValue);
            }
          }
        } else {
          this.removeErrorStyle(nodeValue);
        }
      }
    }
  }


  /**
   * TRACING-1457
   * This method was adjusted to highlight the field controls using methods like setErrorStyles and clearErrorStyles
   * @param fields
   */
  public toVisuableString(fields: AvailableField[] = []): string {
    if (Field.autoCompleteValidator != "" && !isUndefined(Field.autoCompleteValidator)) {
      this.addStyleAutoCompleteValidation();
      return Field.autoCompleteValidator;
    }

    // Checks if div#searchBoxAlert has an error and if not, clears error styles
    let queryContainsAnyError = false;
    if (document.getElementById(Query.SEARCH_BOX_ALERT_ID)) {
      // TODO: This is a problem because is not a scalable solution
      // The main problem is that the error messages and Query text are displayed in the same div tag
      // A better solution, is to have 2 divs: #divErrorMsg & #divQueryText and show and hide one or the other
      queryContainsAnyError = this.containsAnyError(document.getElementById(Query.SEARCH_BOX_ALERT_ID).innerHTML);
    }
    if (!queryContainsAnyError) {
      // Clear all error styles
      this.clearErrorStyles();
    }

    // Checks for Date errors
    let queryString: string = this.toStringRulset(this.query, fields);
    if (queryString.includes("Date")) {
      const message = this.validateDate(queryString);
      if (message.length > 0) {
        this.setErrorStyles(QueryAttributeValues.DATE, false);
        return message;
      }
    }

    // Checks Number Of Threads errors
    if (queryString.includes("Number of Threads")) {
      if (!this.isValidNumberOfThreads(queryString)) {
        this.setErrorStyles(QueryAttributeValues.NUM_CPUS, false);
        return "Invalid Query. Attribute “Number of Threads” only supports one value";
      }
    }

    // Checks for ISA Percentage errors
    if (queryString.includes("ISA Percentage ") && queryString.includes(" or ")) {
      this.setErrorStyles(QueryAttributeValues.ISA_PERCENTAGE, false);
      return "Invalid Query! ISA Percentage filter should use <b> AND </b> condition";
    } else if (queryString.includes("ISA Percentage ")) {
      var isExists = this.validateISACondition(queryString);
      if (isExists == "ISA Not Exists") {
        this.setErrorStyles(QueryAttributeValues.ISA_PERCENTAGE, false);
        return "Invalid Query! ISA Percentage filter should be accompanied with ISA filter";
      } else if (isExists == "Multiple ISA") {
        const attributesTypes = QueryAttributeValues.ISA_PERCENTAGE;
        this.setErrorStyles(attributesTypes, false);
        return "Invalid Query! Only one ISA condition is allowed with ISA Percentage"
      }
    }

    // Checks for empty controls
    if (!this.isValid()) {
      if (this.query.rules.length <= 1) {
        return "";
      } else {
        this.setErrorStyles("", true);
        return "<b>Invalid Query!</b> Contains empty values set on fields";
      }
    }

    // If no errors, then the query is displayed
    return this.toStringRulset(this.query, fields, true, 0);
  }


  private toStringRulset(query: RuleSet, fields: AvailableField[] = [],
                         useLevels: boolean = false, level: number = 0): string {
    let condition: string = query.condition;
    let parts: string[] = [];

    for (let rule of query.rules) {
      if ("condition" in rule) {
        let ruleSet: RuleSet = <RuleSet>rule;
        parts.push(this.toStringRulset(ruleSet, fields, useLevels, level + 1));
      } else if ("field" in rule) {
        let fieldRule: Rule = <Rule>rule;
        parts.push(this.toStringField(fieldRule, fields, useLevels));
      }
    }
    let prefix: string = "";
    let precondition: string = "";
    let postcondition: string = "";
    if (useLevels) {
      precondition = "<b>";
      postcondition = "</b>";
      condition = condition.toUpperCase();
      if (level > 0) {
        prefix += "<br/>";
      }
      for (let i: number = 0; i < level; i++) {
        prefix += "&nbsp;&nbsp;&nbsp;&nbsp;";
      }
    }
    if (parts.length == 0) {
      return "";
    } else if (parts.length == 1) {
      return parts[0];
    } else {
      let result: string = parts[0]; // parts.join(" " + precondition + condition + postcondition + " ");
      if (useLevels && level == 0) {
        if (result.startsWith("<br/>")) {
          let prefix_removal: string = "";
          for (let i: number = 0; i <= level; i++) {
            prefix_removal += "&nbsp;&nbsp;&nbsp;&nbsp;";
          }
          result = result.substring(prefix_removal.length + 5); // 4 = len(<br/>)
        }
      }

      for (let i: number = 1; i < parts.length; i++) {
        if (!parts[i].startsWith(prefix)) {
          result += " " + precondition + condition + postcondition + " " + parts[i];
        } else {
          result += prefix + " " + precondition + condition + postcondition + " " + parts[i];
        }
      }

      if (result.startsWith(prefix)) {
        return "(" + result + ")";
      } else {
        return prefix + "(" + result + ")";
      }
    }
  }

  private toStringField(rule: Rule, fields: AvailableField[] = [], applyStyle: boolean = false): string {
    let fieldPrefix: string = "";
    let fieldPostfix: string = "";
    let opertorPrefix: string = "";
    let opertorPostfix: string = "";

    if (applyStyle) {
      fieldPrefix = "<mark>";
      fieldPostfix = "</mark>";
      opertorPrefix = "<i>";
      opertorPostfix = "</i>";
    }

    let value: string = "empty";
    if (rule.value != null && rule.value != "") {
      value = rule.value;
    }

    let operator: string = rule.operator;
    let field: string = rule.field;
    let filtered_fields = fields.filter(f => f.traceAttribute.value == rule.field);

    if (filtered_fields.length > 0) {
      field = filtered_fields[0].traceAttribute.header;

      let operators = filtered_fields[0].getOperators().filter(o => o.value == operator);
      if (operators.length > 0) {
        operator = operators[0].name;
      }
    }

    return fieldPrefix + field + fieldPostfix
      + " " + opertorPrefix + operator + opertorPostfix
      + " " + value;
  }
}
