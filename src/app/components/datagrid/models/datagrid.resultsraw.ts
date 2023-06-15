import {TraceResult} from "../../../models/app.traceresult";
import {IHashMap} from "../../../models/app.hashmap";
import {NameValue} from "../../../models/app.namevalue";
import {Constants} from "../../../models/app.constants";
import {AppUtilities} from "../../../app.utilities";

export class ResultsRaw {
  public static readonly HSD_NOT_AVAILABLE = "<HSD Link Not Available>";
  public traceName: string;
  public tracePath: string;
  public workload: string;
  public classification: string;
  public instructionWeight: number;
  public cyclesWeight: number;
  public num_cpus: number;
  public user_percent: number;
  public kernel_percent: number;
  public instructionsRepresented: number;
  public cyclesRepresented: number;
  public total_instructions: number;
  public date: string;
  public operating_system: string;
  public compiler: string;
  public invalidfields: string[];
  public ispublished: boolean;
  public ispreproduction: boolean;

  public isaTable: NameValue[];
  public isaSummary: string;
  public isa: string;
  public isaPercentage: number

  public categoryTable: NameValue[];
  public categorySummary: string;
  public category: string;

  public iformTable: NameValue[];
  public iformSummary: string;
  public iform: string;

  public isasetTable: NameValue[];
  public isasetSummary: string;
  public isaset: string;

  public instructionTable: NameValue[];
  public instructionSummary: string;
  public instruction: string;

  public pathlength: number;
  public segment: string;
  public tags: string;
  public component: string;

  public keiko_cpi: string;
  public keiko_l1mpi: string;
  public keiko_l2mpi: string;
  public keiko_llcmpi: string;
  public keiko_icache_miss: string;
  public keiko_jeclear: string;

  public emonConfigurations: string[];
  public emon_cpi: string;
  public emon_l1mpi: string;
  public emon_l2mpi: string;
  public emon_llcmpi: string;

  public func_code_footprint: string;
  public func_cpl_trans: string;
  public func_cr3_trans: string;
  public func_data_footprint: string;
  public func_irqs: string;
  public func_page_faults: string;

  public studyList: string;
  public studyLists: string[];

  public traceLists: string[];
  public traceList: string;

  public isCr3SharedAmongThreads: boolean;
  public cr3SharedData: string[];
  public cr3SharedDatas: string;

  public hasLockInstructions: boolean;
  public lockInstructions: string[];
  public lockInstruction: string;

  public lcatImpact: string;
  public lcatData: boolean;
  public isLcatImpactDisplay: string;
  public HSD: any;
  public hsdLink: any;

  constructor(trace: TraceResult) {
    this.loadFromResult(trace);
  }

  private loadFromResult(trace: TraceResult) {
    this.traceName = trace.traceName;
    this.tracePath = this.getValueToShow(trace.tracePath);

    this.workload = this.getValueToShow(trace.workload);
    this.classification = this.getValueToShow(trace.classification);
    this.instructionWeight = trace.instructionWeight;
    this.cyclesWeight = trace.cycleWeight;
    this.num_cpus = trace.threadCount;
    this.user_percent = trace.userInstructionPercentage;
    this.kernel_percent = trace.kernelInstructionPercentage;
    this.total_instructions = trace.totalInstructionCount;
    this.instructionsRepresented = trace.instructionsRepresented;
    this.cyclesRepresented = trace.cyclesRepresented;
    this.operating_system = trace.operativeSystem;
    this.compiler = trace.compiler;
    this.invalidfields = this.getInvalidValues(trace.invalidFields);
    this.ispublished = trace.published;
    this.ispreproduction = trace.preproduction;

    this.date = this.getDateToShow(trace.publicationDate);
    this.pathlength = trace.totalInstructionCount;
    this.segment = this.getValueToShow(trace.segment);
    this.tags = "";
    this.component = this.getValueToShow(trace.component);

    this.instructionSummary = this.getTopThree(trace.instructions);
    this.instructionTable = AppUtilities.getTable(trace.instructions);
    this.instruction = this.convertToString(trace.instructions);

    this.isaSummary = this.getTopThree(trace.isas);
    this.isaTable = AppUtilities.getTable(trace.isas);
    this.isa = this.convertToString(trace.isas);
    this.isaPercentage = trace.isaPercentage;

    this.iformSummary = this.getTopThree(trace.iforms);
    this.iformTable = AppUtilities.getTable(trace.iforms);
    this.iform = this.convertToString(trace.iforms);

    this.categorySummary = this.getTopThree(trace.categories);
    this.categoryTable = AppUtilities.getTable(trace.categories);
    this.category = this.convertToString(trace.categories);

    this.isasetSummary = this.getTopThree(trace.isaSets);
    this.isasetTable = AppUtilities.getTable(trace.isaSets);
    this.isaset = this.convertToString(trace.isaSets);

    this.keiko_cpi = this.getKeikoValue(trace, "cpi");
    this.keiko_l1mpi = this.getKeikoValue(trace, "l1mpi");
    this.keiko_l2mpi = this.getKeikoValue(trace, "l2mpi");
    this.keiko_llcmpi = this.getKeikoValue(trace, "llcmpi");
    this.keiko_cpi = this.getPerformanceSimulationMetricValue(trace, "cpi");
    this.keiko_l1mpi = this.getPerformanceSimulationMetricValue(trace, "l1mpi");
    this.keiko_l2mpi = this.getPerformanceSimulationMetricValue(trace, "l2mpi");
    this.keiko_llcmpi = this.getPerformanceSimulationMetricValue(trace, "llcmpi");
    this.keiko_icache_miss = this.getKeikoValue(trace, "icache_miss");
    this.keiko_jeclear = this.getKeikoValue(trace, "jeclear");

    this.emonConfigurations = trace.emonConfigurations;
    this.emon_cpi = "";
    this.emon_l1mpi = "";
    this.emon_l2mpi = "";
    this.emon_llcmpi = "";

    this.func_code_footprint = this.getFuncValue(trace, "code-footprint-kb");
    this.func_cpl_trans = this.getFuncValue(trace, "cpl-trans");
    this.func_cr3_trans = this.getFuncValue(trace, "cr3-trans");
    this.func_data_footprint = this.getFuncValue(trace, "data-footprint-kb");
    this.func_irqs = this.getFuncValue(trace, "irqs");
    this.func_page_faults = this.getFuncValue(trace, "page-faults");

    this.studyList = trace.studyLists.join(";");
    this.studyLists = trace.studyLists;

    this.traceList = trace.traceLists.join(";");
    this.traceLists = trace.traceLists;

    this.isCr3SharedAmongThreads = trace.isCr3SharedAmongThreads;
    this.cr3SharedData = trace.cr3SharedData;
    this.cr3SharedDatas = trace.cr3SharedData.join(";");

    this.hasLockInstructions = trace.hasLockInstructions;
    this.lockInstruction = trace.lockInstructions.join(";");
    this.lockInstructions = trace.lockInstructions;
    this.lcatImpact = trace.lcatimpact;
    this.lcatData = trace.hasLCATData;
    this.isLcatImpactDisplay = this.calculateLactDisplay(this.lcatData, this.lcatImpact);
    this.HSD = this.validateHSD(trace.hsd);
    this.hsdLink = trace.hsd;
  }

  private calculateLactDisplay(lcatData: boolean, lcatimpact: string) {
    if (lcatData && lcatimpact !== null) {
      return lcatimpact;
    }
    return "NA";
  }

  public validateHSD(hsd) {

    let result = "";
    if (hsd === 0 || hsd === null) {
      result = ResultsRaw.HSD_NOT_AVAILABLE;
    } else {
      result = "https://hsdes.intel.com/resource/" + hsd;
    }
    return result;
  }

  public setInstructions(instructions: IHashMap) {
    this.instruction = this.convertToString(instructions);
  }

  /**
   * TODO add comments
   * @param trace
   * @param propertyName
   */
  private getKeikoValue(trace: TraceResult, propertyName: string) {
    for (const keikoStat of trace.keikoStats) {
      if (keikoStat.metric == propertyName) {
        return this.getValueToShow(keikoStat.value);
      }
    }
    return Constants.NOT_AVAILABLE;
  }

  /**
   * TODO add comments
   * @param trace
   * @param propertyName
   */
  private getPerformanceSimulationMetricValue(trace: TraceResult, propertyName: string) {
    for (const performance of trace.performanceSimulationMetrics) {
      if (performance.metric == propertyName) {
        return this.getValueToShow(performance.value);
      }
    }
    return Constants.NOT_AVAILABLE;
  }

  private getFuncValue(trace: TraceResult, propertyName: string) {
    let value = trace.funcionalMetrics[propertyName];
    return this.getValueToShow(value);
  }

  private getInvalidValues(value: string) {
    if (value == null || String(value) == "")
      return [];
    else
      return value.split("#");
  }

  private getDateToShow(value: string) {
    if (value == null || String(value) == "")
      return Constants.NOT_AVAILABLE;
    else
      return value.substring(0, value.length - 3);
  }

  private getValueToShow(value: string) {
    if (value == null || String(value) == "")
      return Constants.NOT_AVAILABLE;
    else
      return value;
  }

  private getTopThree(data: IHashMap): string {
    let result: string = "";

    let keys: string[] = Object.keys(data);
    let cont = 0;
    for (let key of keys) {
      let value = data[key];
      if (value.length > 5) {
        value = value.substr(0, 5);
      }
      result += key + ":" + value + ";";
      cont++;
      if (cont >= 3)
        break;
    }

    return result;
  }

  private convertToString(data: IHashMap): string {
    let result: string = "";

    let keys: string[] = Object.keys(data);
    for (let key of keys) {
      result += key + ":" + data[key] + ";";
    }

    return result;
  }

}
