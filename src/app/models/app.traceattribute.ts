import {TraceAttributeGroup} from "./app.traceattributegroup";

export class TraceAttribute {

  public header: string;
  public value: string;
  public isSearchable: boolean;
  public canShowInGrid: boolean;

  constructor(header: string, value: string, isSearchable: boolean = true, canShowInGrid: boolean = true) {
    this.header = header;
    this.value = value;
    this.isSearchable = isSearchable;
    this.canShowInGrid = canShowInGrid;
  }

  public static getAttributeGroup(value: string): TraceAttributeGroup {
    if (value.startsWith("keiko_"))
      return TraceAttributeGroup.Keiko;

    if (value.startsWith("emon_"))
      return TraceAttributeGroup.Emon;

    if (value.startsWith("func_"))
      return TraceAttributeGroup.Func;

    if (value == "iscr3sharedamongthreads" || value == "cr3shareddata" || value == "lockinstructions" || value == "haslockinstructions")
      return TraceAttributeGroup.MtCooperativeIndicator;

    if (value === "isaset" || value === "isa" || value === "isaPercentage" || value === "category" || value === "iform" || value === "instruction") {
      return TraceAttributeGroup.DisasmGroup;
    }

    return TraceAttributeGroup.General;
  }

  public getAttributeGroup(): TraceAttributeGroup {
    return TraceAttribute.getAttributeGroup(this.value);
  }
}
