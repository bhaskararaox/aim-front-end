import {AvailableField} from "../models/searchbox.availablefield";
import {TraceAttributes} from "../../../models/app.traceattributes";
import {TraceAttribute} from "../../../models/app.traceattribute";
import {TraceAttributeGroup} from "../../../models/app.traceattributegroup";
import {QueryAttributeValues} from "../models/searchbox.queryattributevalues";
import {Constants} from "../../../models/app.constants";


export class AvailableFieldsController {

  public availableFields: AvailableField[] = [];
  private attributesToExclude: string[] = [QueryAttributeValues.TRACE_NAME, QueryAttributeValues.APPLICATION, QueryAttributeValues.ISA_PERCENTAGE];
  private flagAttributes: string[] = [QueryAttributeValues.HAS_LOCK_INSTRUCTIONS, QueryAttributeValues.IS_CR3_SHARED_AMONG_THREADS]
  public isSelectAllIndeterminate: boolean = false;
  public selectAllCheckBox: boolean;

  constructor() {
    for (let traceAttribute of TraceAttributes.getAllAttributes()) {
      this.availableFields.push(new AvailableField(traceAttribute, traceAttribute.getAttributeGroup()));
    }
  }

  public checkAttribute(attribute: TraceAttribute, isUserAdmin: boolean) {
    if (this.attributesToExclude.includes(attribute.value)) {
      return;
    }
    for (let field of this.availableFields) {
      if (attribute.canShowInGrid && field.traceAttribute.value == attribute.value) {
        field.isCheck = true;
        break;
      } else if (field.traceAttribute.value == QueryAttributeValues.CR3_SHARED_DATA
        && attribute.value == QueryAttributeValues.IS_CR3_SHARED_AMONG_THREADS) {
        field.isCheck = true;
        break;
      } else if (field.traceAttribute.value == QueryAttributeValues.LOCK_INSTRUCTIONS
        && attribute.value == QueryAttributeValues.HAS_LOCK_INSTRUCTIONS) {
        field.isCheck = true;
        break;
      } else if (field.traceAttribute.value == QueryAttributeValues.LCAT_DATA
        && attribute.value == QueryAttributeValues.LCAT_IMPACT){
        field.isCheck = true;
        break;
      }
    }
    this.updateSelectAll(isUserAdmin);
  }

  public clearSelectAll() {
    for (let field of this.availableFields) {
      field.isCheck = false;
    }
  }

  public selectUnSelectAll(check: boolean, isAdmin: boolean) {
    this.isSelectAllIndeterminate = false;
    for (let field of this.availableFields) {
      field.isCheck = check;
      if (this.attributesToExclude.includes(field.traceAttribute.value) ||
        (Constants.ADMIN_FIELDS.includes(field.traceAttribute.value) && !isAdmin)) {
        field.isCheck = false;
      }
    }
  }

  public updateSelectAll(isAdminView: boolean): boolean {
    let checkFlag = true;
    let indeterminateFlag = false;
    for (let field of this.availableFields) {
      if (!isAdminView && Constants.ADMIN_FIELDS.includes(field.traceAttribute.value)) {
        continue;
      }
      else if (!this.attributesToExclude.includes(field.traceAttribute.value) && !this.flagAttributes.includes(field.traceAttribute.value)) {
        if (!field.isCheck) {
          checkFlag = false;
        }
        else {
          indeterminateFlag = true;
        }
      }
      if (!checkFlag) {
        if (indeterminateFlag) {
          this.selectAllCheckBox = false;
          this.isSelectAllIndeterminate = true;
        }
        else {
          this.isSelectAllIndeterminate = false;
          this.selectAllCheckBox = false;
        }
      }
      else {
        this.isSelectAllIndeterminate = false;
        this.selectAllCheckBox = true;
      }
    }
    return checkFlag;
  }

  public unselectAdminFields() {
    let nonAdminFieldSelected = false;
    for (let field of this.availableFields) {
      if (Constants.ADMIN_FIELDS.includes(field.traceAttribute.value)) {
        field.isCheck = false;
      }
    }
    for (let field of this.availableFields) {
      if (!Constants.ADMIN_FIELDS.includes(field.traceAttribute.value) && field.isCheck) {
        nonAdminFieldSelected = true;
        break;
      }
    }
    if (this.selectAllCheckBox == false && !nonAdminFieldSelected) {
      this.isSelectAllIndeterminate = false;
    }
  }

  public selectAdminFields() {
    for (let field of this.availableFields) {
      if (Constants.ADMIN_FIELDS.includes(field.traceAttribute.value)) {
        field.isCheck = true;
      }
    }
  }


  public getGeneralFields(isAdmin: boolean) {
    let filteredFields: AvailableField[] =
      this.availableFields.filter(field => field.group == TraceAttributeGroup.General
        && field.traceAttribute.canShowInGrid
        && !this.attributesToExclude.includes(field.traceAttribute.value)
        && (!Constants.ADMIN_FIELDS.includes(field.traceAttribute.value) || isAdmin));
    return filteredFields;
  }

  public getKeikoFields() {
    return this.availableFields.filter(field => field.group == TraceAttributeGroup.Keiko
      && field.traceAttribute.canShowInGrid);
  }

  public getEmonFields() {
    return this.availableFields.filter(field => field.group == TraceAttributeGroup.Emon
      && field.traceAttribute.canShowInGrid);
  }

  public getFuncFields() {
    return this.availableFields.filter(field => field.group == TraceAttributeGroup.Func
      && field.traceAttribute.canShowInGrid);
  }

  public getMtCooperativeFields() {
    return this.availableFields.filter(field => field.group == TraceAttributeGroup.MtCooperativeIndicator
      && field.traceAttribute.canShowInGrid);
  }

  public getDisasmXEDFields() {
    return this.availableFields.filter(field => field.group === TraceAttributeGroup.DisasmGroup
      && field.traceAttribute.canShowInGrid);
  }

  public getSelectedAttributes(): TraceAttribute[] {
    return this.availableFields.filter(field => field.isCheck).map(field => field.traceAttribute);
  }
}
