import {TraceAttribute} from "../../../models/app.traceattribute";
import {TraceAttributeGroup} from "../../../models/app.traceattributegroup";
import {QueryAttributeValues} from "./searchbox.queryattributevalues";
import {QueryOperator} from "./searchbox.queryoperator";
import {AppUtilities} from "../../../app.utilities";
import {NameValue} from "../../../models/app.namevalue";


export class AvailableField {
  public traceAttribute: TraceAttribute;
  public group: TraceAttributeGroup;
  public isCheck: boolean = false;

  constructor(traceAttribute: TraceAttribute, group: TraceAttributeGroup) {
    this.traceAttribute = traceAttribute;
    this.group = group;
  }

  public isAutomplete(): boolean {
    return this.traceAttribute.value == QueryAttributeValues.INSTRUCTION ||
      this.traceAttribute.value == QueryAttributeValues.ISA ||
      this.traceAttribute.value == QueryAttributeValues.ISA_SET ||
      this.traceAttribute.value == QueryAttributeValues.IFORM ||
      this.traceAttribute.value == QueryAttributeValues.CATEGORY ||
      this.traceAttribute.value == QueryAttributeValues.TAGS ||
      this.traceAttribute.value == QueryAttributeValues.CLASSIFICATION ||
      this.traceAttribute.value == QueryAttributeValues.STUDY_LIST ||
      this.traceAttribute.value == QueryAttributeValues.TRACE_LIST ||
      this.traceAttribute.value == QueryAttributeValues.NUM_CPUS ||
      this.traceAttribute.value == QueryAttributeValues.APPLICATION ||
      this.traceAttribute.value == QueryAttributeValues.OPERATION_SYSTEM ||
      this.traceAttribute.value == QueryAttributeValues.COMPILER;
  }

  public getType(): string {

    if (this.traceAttribute.value == QueryAttributeValues.TRACE_NAME ||
      this.traceAttribute.value == QueryAttributeValues.ISA ||
      this.traceAttribute.value == QueryAttributeValues.INSTRUCTION ||
      this.traceAttribute.value == QueryAttributeValues.CLASSIFICATION ||
      this.traceAttribute.value == QueryAttributeValues.TAGS ||
      this.traceAttribute.value == QueryAttributeValues.STUDY_LIST ||
      this.traceAttribute.value == QueryAttributeValues.TRACE_LIST ||
      this.traceAttribute.value == QueryAttributeValues.APPLICATION ||
      this.traceAttribute.value == QueryAttributeValues.OPERATION_SYSTEM ||
      this.traceAttribute.value == QueryAttributeValues.COMPILER ||
      this.traceAttribute.value == QueryAttributeValues.INVALID_FIELDS ||
      this.traceAttribute.value == QueryAttributeValues.CR3_SHARED_DATA ||
      this.traceAttribute.value == QueryAttributeValues.LOCK_INSTRUCTIONS) {
      return "string";
    }
    else if (this.traceAttribute.value == QueryAttributeValues.DATE) {
      return "month";
    }
    else if (this.traceAttribute.value == QueryAttributeValues.SEGMENT) {
      return "multipledropdown";
    }
    else if (this.traceAttribute.value == QueryAttributeValues.IS_CR3_SHARED_AMONG_THREADS || this.traceAttribute.value == QueryAttributeValues.IS_PUBLISHED ||
      this.traceAttribute.value == QueryAttributeValues.IS_PREPRODUCTION || this.traceAttribute.value == QueryAttributeValues.HAS_LOCK_INSTRUCTIONS) {
      return "boolean";
    }
    else if (this.traceAttribute.value == QueryAttributeValues.LCAT_IMPACT || this.traceAttribute.value == QueryAttributeValues.LCAT_DATA) {
      return "impact";
    }
    else {
      return "number";
    }
  }

  public getOperators(): NameValue[] {
    return AppUtilities.clone(QueryOperator.getInstance().getOperators(this.traceAttribute));
  }

  public getDefaultOperator(): NameValue {
    return this.getOperators()[0];
  }
}
