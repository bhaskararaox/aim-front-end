import {Query} from "../models/searchbox.query";
import {QueryBuilderConfig} from "angular2-query-builder";
import {Field} from "../models/searchbox.field";
import {AvailableFieldsController} from "./searchbox.availablefieldscontroller";
import {AvailableField} from "../models/searchbox.availablefield";
import {AppInitData} from "../../../models/app.initdata";
import {QueryAttributeValues} from "../models/searchbox.queryattributevalues";
import {Option} from "../models/searchbox.option";
import {TraceAttribute} from "../../../models/app.traceattribute";
import {QueryExpressionController} from "./searchbox.queryexpressioncontroller";
import {RuleSet, Rule} from "../models/searchbox.ruleset";
import {TraceAttributeGroup} from "../../../models/app.traceattributegroup";
import {Constants} from "../../../models/app.constants";
import {userInfo} from "os";

export class QueryController {
  private availableFieldsController: AvailableFieldsController;
  private appInitData: AppInitData;
  private segmentValues: any[];
  public aimpactQuery: Query;
  public config: QueryBuilderConfig;
  public queryExpressionController: QueryExpressionController;

  constructor(availableFieldsController: AvailableFieldsController) {
    this.availableFieldsController = availableFieldsController;
    this.queryExpressionController = new QueryExpressionController();
    this.appInitData = null;
    this.segmentValues = [];
    this.aimpactQuery = new Query({
      condition: "and",
      rules: []
    });
    this.config = {
      fields: {}
    };
    this.queryExpressionController.initialize(this.aimpactQuery);
  }

  public initialize(appInitData: AppInitData) {
    this.appInitData = appInitData;
    this.getSegmentAsNameValue();
    this.clear();
  }

  public onRuleFieldChange(rule: Rule) {
    const field = this.getFieldByName(rule.field);
    rule.operator = field.defaultOperator;
    Field.autoCompleteValidator = "";
    rule.values = [];
    rule.value = "";
  }

  public getSegmentAsNameValue() {
    for (const segment of this.appInitData.traceSegments.sort()) {
       this.segmentValues.push({label: segment, value: segment });
    }
  }

  public addRule() {
    const rule: Rule = <Rule>{field: "trace", operator: "Contains", value: ""};
    this.aimpactQuery.addRule(rule);
    this.queryExpressionController.addRule(rule);
  }

  public removeRule(ruleId: number) {
    this.aimpactQuery.removeRule(ruleId);
    this.queryExpressionController.removeRule(ruleId);
  }

  public isValid(): boolean {
    return this.aimpactQuery.isValid() && this.queryExpressionController.isValid;
  }

  public removeAdminFields() {
    this.availableFieldsController.unselectAdminFields();
    for (const rule of this.aimpactQuery.query.rules) {
      if ("field" in rule) {
        const fieldRule: Rule = <Rule>rule;
        if (Constants.ADMIN_FIELDS.includes(fieldRule.field)) {
          this.removeRule(fieldRule.id)
        }
      }
    }

    if (this.aimpactQuery.query.rules.length == 0) {
      this.addRule();
    }
  }

  public selectAdminFields() {
    this.availableFieldsController.selectAdminFields();
  }

  public setAimpactQuery(query: Query) {
    this.aimpactQuery = query;
    this.updateCategoryRules();
    this.availableFieldsController.clearSelectAll();
    this.updateAvailableFieldsCheckValues();
    this.queryExpressionController.initialize(this.aimpactQuery);
  }

  private updateCategoryRules(query: RuleSet = null) {
    if (query == null) {
      query = <RuleSet>this.aimpactQuery.query;
    }
    for (const rule of query.rules) {
      if ("condition" in rule) {
        const ruleSet: RuleSet = <RuleSet>rule;
        this.updateCategoryRules(ruleSet);
      } else if ("field" in rule) {
        const fieldRule: any = rule;
        if (fieldRule.field in this.config.fields) {
          const field: Field = <Field>this.config.fields[fieldRule.field];
          if (field.type == "category") {
            fieldRule.values = fieldRule.value.split(",");
          }
        }
      }
    }
  }

  public updateAvailableFieldsCheckValues() {
    this.checkAvailableField(<RuleSet>this.aimpactQuery.query);
  }

  private checkAvailableField(query: RuleSet) {
    for (const rule of query.rules) {
      if ("condition" in rule) {
        const ruleSet: RuleSet = <RuleSet>rule;
        this.checkAvailableField(ruleSet);
      } else if ("field" in rule) {
        const fieldRule: Rule = <Rule>rule;
        const attributes: TraceAttribute[] =
          this.availableFieldsController.availableFields
            .filter(a => a.traceAttribute.value == fieldRule.field)
            .map(a => a.traceAttribute);
        for (const attribute of attributes) {
          this.availableFieldsController.checkAttribute(attribute, false);
        }
      }
    }
  }

  public clear() {
    this.config = {
      fields: {}
    };
    this.populateConfig();
    this.aimpactQuery.clearQuery();
    this.queryExpressionController.initialize(this.aimpactQuery);
  }

  public getHelpText(rule: Rule): string {
    const fieldName: string = rule.field;
    const field = this.config.fields[fieldName];
    const type = field.type;
    if (type == "text" || type == "string" || type == "category")
      return "You can search by comma separated values";
    else if (type == "date")
      return "You can search by date mm/dd/yyyy";
    else
      return "You can search by metric numeric value";
  }

  public getOperatorTooltip(operator) {
    switch (operator) {
      case "Contains":
        return "If attribute value matches the pattern of each entry value";
      case "Not Contains":
        return "If attribute value does not match any entry pattern";
      case "In":
      case  "Matches":
        return "If attribute value has at least one of the list of entry values";
      case "Not In":
        return "If attribute value is different to all of the list of entry values";
      case "Sequence":
        return "If attribute value has all of the list of entry values in the order specified";
      case "==":
        return "If attribute value is equal to the entry value";
      case ">":
        return "If attribute value is greater than the entry value";
      case "<":
        return "If attribute value is less than the entry value";
      case ">=":
        return "If attribute value is greater than or equal to the entry value";
      case "<=":
        return "If attribute value is less than or equal to the entry value";
      default:
        return "Not available";
    }
  }

  public getAllFields(isAdmin: boolean): Field[] {
    const fields: Field[] = [];
    for (const fieldName in this.config.fields) {
      if (!Constants.ADMIN_FIELDS.includes(fieldName) || isAdmin) {
        fields.push(<Field>this.config.fields[fieldName]);
      }
    }
    return fields;
  }

  private populateConfig(): void {
    let arrayOfQueryFields: AvailableField [];
    let fieldValue: string;
    // The queryFields of the queryFieldsController is used at this moment, because currentQuery conditions is empty.
    arrayOfQueryFields = this.availableFieldsController.availableFields;

    for (const queryField of arrayOfQueryFields) {
      //Need to exclude EMON/EDP field from Attribute dropdown.
      if (queryField.traceAttribute.isSearchable) {
        const field: Field = new Field();
        field.name = queryField.traceAttribute.header;
        field.value = queryField.traceAttribute.value;

        if (field.value.startsWith("keiko")) {
          field.category = "performance";
        }

        if (field.value.startsWith("func")) {
          field.category = "functional";
        }

        if (queryField.traceAttribute.getAttributeGroup() == TraceAttributeGroup.MtCooperativeIndicator) {
          field.category = "mtCooperative";
        }

        if (queryField.traceAttribute.getAttributeGroup() === TraceAttributeGroup.DisasmGroup) {
          field.category = "disasm_group";
        }

        if (queryField.isAutomplete()) {
          field.type = "category";
          const optionValues: string[] = this.getAutoCompleteValues(queryField);
          for (const optionValue of optionValues) {
            const option: Option = new Option();
            option.name = optionValue;
            option.value = optionValue;
            field.options.push(option);
          }
        }
        else {
          field.type = queryField.getType();
        }

        field.defaultOperator = queryField.getDefaultOperator().name;

        for (const operator of queryField.getOperators()) {
          field.operators.push(operator.name);
        }

        fieldValue = queryField.traceAttribute.value;
        this.config.fields[fieldValue] = field;
      }
    }
    console.log(this.config);
  }

  public getFieldByName(fileName: string): Field {
    return <Field>this.config.fields[fileName];
  }

  private getAutoCompleteValues(field: AvailableField): string[] {
    if (this.appInitData == null) {
      return [];
    }
    switch (field.traceAttribute.value) {
      case QueryAttributeValues.SEGMENT:
        return this.appInitData.traceSegments.sort();
      case QueryAttributeValues.CLASSIFICATION:
        return this.appInitData.traceClassification.sort();
      case QueryAttributeValues.ISA_SET:
        return this.appInitData.isaSets.sort();
      case QueryAttributeValues.IFORM:
        return this.appInitData.iforms.sort();
      case QueryAttributeValues.CATEGORY:
        return this.appInitData.categories.sort();
      case QueryAttributeValues.ISA:
        return this.appInitData.isaExtensions.sort();
      case QueryAttributeValues.INSTRUCTION:
        return this.appInitData.instructions.sort();
      case QueryAttributeValues.TAGS:
        return this.appInitData.tags.sort();
      case QueryAttributeValues.STUDY_LIST:
        return this.appInitData.studyLists.sort();
      case QueryAttributeValues.TRACE_LIST:
        return this.appInitData.traceLists.sort();
      case QueryAttributeValues.NUM_CPUS:
        return this.appInitData.numCpus.sort((n1, n2) => Number(n1) - Number(n2));
      case QueryAttributeValues.APPLICATION:
        return this.appInitData.applications.sort();
      case QueryAttributeValues.OPERATION_SYSTEM:
        return this.appInitData.operatingSystems.sort();
      case QueryAttributeValues.COMPILER:
        return this.appInitData.compilers.sort();
      default:
        return [];
    }
  }

  public getTopQueries(): Query[] {
    const topQueries: Query[] = [];
    let aimpactQuery: Query = new Query({
      condition: "and",
      rules: [{field: QueryAttributeValues.INSTRUCTION, operator: "Sequence", value: "ADDSS,MULSS,SUBSS"}]
    });
    topQueries.push(aimpactQuery);

    aimpactQuery = new Query({condition: "and", rules: [{field: "keiko_cpi", operator: ">=", value: "0.1"}]});
    topQueries.push(aimpactQuery);

    aimpactQuery = new Query({
      condition: "and",
      rules: [
        {field: QueryAttributeValues.TRACE_NAME, operator: "Contains", value: "cpu2006"},
        {field: QueryAttributeValues.TRACE_NAME, operator: "Contains", value: "linux"}
      ]
    });
    topQueries.push(aimpactQuery);

    aimpactQuery = new Query({
      condition: "and",
      rules: [
        {field: QueryAttributeValues.TRACE_NAME, operator: "Contains", value: "hsw2300"},
        {field: "keiko_cpi", operator: ">=", value: "0.573"},
        {field: "keiko_cpi", operator: "<=", value: "0.673"},
        {field: "keiko_l1mpi", operator: ">=", value: "0.0174"},
        {field: "keiko_l1mpi", operator: "<=", value: "0.0274"}
      ]
    });
    topQueries.push(aimpactQuery);

    aimpactQuery = new Query({
      condition: "and",
      rules: [
        {field: QueryAttributeValues.TRACE_NAME, operator: "Contains", value: "mlbench"},
        {field: QueryAttributeValues.ISA, operator: "Contains", value: "AVX512EVEX,AVX512VEX"}
      ]
    });
    topQueries.push(aimpactQuery);

    aimpactQuery = new Query({
      condition: "and",
      rules: [
        {field: QueryAttributeValues.TRACE_NAME, operator: "Contains", value: "dpdk"},
        {field: QueryAttributeValues.ISA, operator: "Contains", value: "AVX"}
      ]
    });
    topQueries.push(aimpactQuery);

    return topQueries;
  }
}
