import {NameValue} from "../../../models/app.namevalue";
import {TraceAttribute} from "../../../models/app.traceattribute";
import {QueryAttributeValues} from "./searchbox.queryattributevalues";


export class QueryOperator{

  private allOperators : NameValue[] = [] ;
  public static instance : QueryOperator = new QueryOperator();

  public static  getInstance(){
    return this.instance;
  }

  private constructor() {
    this.loadAllOperators();
  }

  public getOperator(value : string) : NameValue{
    var filtered = this.allOperators.filter(o => o.value == value);
    if (filtered != null && filtered.length == 1)
      return filtered[0];

    return null;
  }

  public loadAllOperators(){
    this.allOperators.push(new NameValue("Contains", "contains"));
    this.allOperators.push(new NameValue("In", "in"));
    this.allOperators.push(new NameValue("Not In", "not_in"));
    this.allOperators.push(new NameValue("Not Contains", "not_contains"));
    this.allOperators.push(new NameValue("Matches", "matches"));
    this.allOperators.push(new NameValue("Sequence", "sequence"));
    this.allOperators.push(new NameValue("==", "equals"));
    this.allOperators.push(new NameValue(">", "greater_than"));
    this.allOperators.push(new NameValue("<", "less_than"));
    this.allOperators.push(new NameValue(">=", "greater_equal_than"));
    this.allOperators.push(new NameValue("<=", "less_equal_than"));
  }

  public getOperators(attribute : TraceAttribute) : NameValue[]{
    var operators : NameValue[] = [];

    if (attribute.value == QueryAttributeValues.STUDY_LIST || attribute.value == QueryAttributeValues.TRACE_LIST){
      operators.push(this.getOperator("contains"));
      operators.push(this.getOperator("in"));
      return operators;
    }

    if (attribute.value == QueryAttributeValues.TRACE_NAME || attribute.value == QueryAttributeValues.INVALID_FIELDS){
      operators.push(this.getOperator("contains"));
      operators.push(this.getOperator("not_contains"));

      return operators;
    }

    if (attribute.value == QueryAttributeValues.CLASSIFICATION || attribute.value == QueryAttributeValues.SEGMENT ||
      attribute.value == QueryAttributeValues.TAGS || attribute.value == QueryAttributeValues.APPLICATION ||
      attribute.value == QueryAttributeValues.OPERATION_SYSTEM || attribute.value == QueryAttributeValues.COMPILER){
      operators.push(this.getOperator("contains"));
      operators.push(this.getOperator("not_contains"));
      operators.push(this.getOperator("in"));
      operators.push(this.getOperator("not_in"));

      return operators;
    }

    if (attribute.value == QueryAttributeValues.ISA
      || attribute.value == QueryAttributeValues.INSTRUCTION
      || attribute.value == QueryAttributeValues.IFORM
      || attribute.value == QueryAttributeValues.CATEGORY
      || attribute.value == QueryAttributeValues.ISA_SET){
      operators.push(this.getOperator("contains"));
      operators.push(this.getOperator("not_contains"));
      operators.push(this.getOperator("matches"));
      operators.push(this.getOperator("in"));
      operators.push(this.getOperator("not_in"));

      if (attribute.value == QueryAttributeValues.INSTRUCTION){
        operators.push(this.getOperator("sequence"));
      }

      return operators;
    }

    if ( attribute.value == QueryAttributeValues.IS_PREPRODUCTION || attribute.value == QueryAttributeValues.IS_CR3_SHARED_AMONG_THREADS || attribute.value == QueryAttributeValues.IS_PUBLISHED ||
      attribute.value == QueryAttributeValues.HAS_LOCK_INSTRUCTIONS || attribute.value == QueryAttributeValues.LCAT_IMPACT) {
      operators.push(this.getOperator("equals"));
      return operators;
    }

    operators.push(this.getOperator("equals"));
    operators.push(this.getOperator("greater_than"));
    operators.push(this.getOperator("less_than"));
    operators.push(this.getOperator("greater_equal_than"));
    operators.push(this.getOperator("less_equal_than"));

    return operators;
  }
}
