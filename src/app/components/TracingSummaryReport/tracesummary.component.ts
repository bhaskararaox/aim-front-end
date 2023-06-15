import {Component, OnInit, ViewChild} from "@angular/core";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {WeeklySummaryPerComponent} from "./models/tracesumary.weeklysummarypercomponent";
import {HSDSightings} from "./models/tracesummary.sightingshsdreport";
import {JiraConsolidation} from "./models/tracesummary.jiraconsolidation";
import {WeeklyComponentPassFail} from "./models/tracesummary.weeklycomponentfailpass";
import {QuarterlyFailureSummary} from "./models/QuarterlyFailureSummary"
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/toPromise";
import {forkJoin} from "rxjs/observable/forkJoin";
import {isNull} from "util";
import {DataTable} from "primeng/primeng";
import {WeeklySummaryPerComponentParameters} from "./models/tracesummary.weekysummarypercomponent.parameter";
import {TraceQuarterlyPassFailSummary} from "./models/TraceQuarterlyPassFailSummary";
import {OverallSummaryPerComponent} from "./models/overallsummarypercomponent";
import {DatewiseSummaryComponent} from "./models/datewisesummarycomponent";
import {TracewiseCondensedSummaryComponent} from "./models/TracewiseCondensedReportComponent";


@Component({
  selector: "trace-report",
  templateUrl: "./tracesummary.component.html",
  styleUrls: ["./tracesummary.component.css"]
})

export class TraceSummaryComponent implements OnInit {
  private dataService: TraceDataService;
  public messageService: MessageService;
  public hsdSightings: HSDSightings = null;
  public jiraConsolidation: JiraConsolidation = null;
  public weeklySummaryPerComponentList: OverallSummaryPerComponent[] = [];
  public weeklyComponentPassFailList: WeeklyComponentPassFail[] = [];
  public quarterlyPassFailSummaryList: TraceQuarterlyPassFailSummary[] = [];
  public overallSummaryPerComponentList: OverallSummaryPerComponent[] = [];
  public datewiseSummaryComponentList: DatewiseSummaryComponent[] = [];
  public quarterlyFailureSummaryList: QuarterlyFailureSummary[] = [];
  public workloadSummaryPerComponentList: OverallSummaryPerComponent[] = [];
  public workloadSummaryPerentagePerComponentList: OverallSummaryPerComponent[] = [];
  public condensedReport: TracewiseCondensedSummaryComponent[] = [];
  public isDataReadyToDisplay = false;
  public isHsdView = false;
  public isJiraView = false;
  public isWeeklyComponentPassFail = false;
  public isWeeklySummaryPerComponent = false;
  public isQuarterlyPassFailSummary = false;
  public isWorkloadSummaryPerComponent = false;
  public isWorkloadSummaryPercentagePerComponent = false;
  public isQuarterlyFailureSummary = false;
  public isOverAllSummary = false;
  public isTraceSummaryViewable = false;
  public isDatewiseReportViewable = true;
  public fromDate: string;
  public toDate: string;
  public todaysDate: Date;
  public start: Date;
  public end: Date;
  public groups: any = [];
  public groupsweeklySummary: any = [];
  public isCondensedDateReport = true;
  public isDetailedDateReport = false;
  public dateDataView= "condensedview";
  public isQuartelyDatewiseView = false;

  @ViewChild("dt") dt: DataTable;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    /*this.weeklyComponentPassFailList = [];
    this.quarterlyPassFailSummaryList = [];
    this.weeklySummaryPerComponentList = [];
    this.overallSummaryPerComponentList = [];
    this.datewiseSummaryComponentList = [];
    this.workloadSummaryPerComponentList = [];
    this.quarterlyFailureSummaryList = [];
    this.workloadSummaryPerentagePerComponentList = [];*/
    this.todaysDate = new Date();
    this.getLastQuarterData();
  }

  ngOnInit() {

  }

  private getTraceSummaryReport(): any {
    this.messageService.showSpinner();
    const subscription = this.dataService.getTraceSummaryReport().subscribe(res => {
      // -----------------------------------------------------------------------------------------------
       this.messageService.searchCompleted(res)
      this.loadData(JSON.stringify(res.data));

    });
    // -----------------------------------------------------------------------------------------------

  }

  private loadData(responseData: string) {
    this.isTraceSummaryViewable = true;
    if (this.isTraceSummaryViewable === true && this.overallSummaryPerComponentList.length === 0) {
      const reportJson: any = JSON.parse(responseData);
      this.loadHsdData(reportJson.sightingReprot)
      this.loadJiraConsolidation(reportJson.jiraConsolidation)
      this.weeklySummaryPerComponentList = this.loadWeeklySummaryPerComponentPassorFail(reportJson.weeklySummaryPerComponent);
      this.loadWeeklySuammryPassFail(reportJson.weeksummaryPassFail);
      this.loadQuarterlySuammryPassFail(reportJson.quarterlyPassFailList);
      this.loadOverallSummaryPerComponent(reportJson.overallSummaryComponentList);
      this.loadQuarterlyFailureSummary(reportJson.quarterlycomponentwiseFailureSummary);
      this.workloadSummaryPerComponentList = this.loadWorkloadSummaryLast3Months(reportJson.last3MonthsSummaryList)
      this.workloadSummaryPerentagePerComponentList = this.loadWorkloadSummaryLast3MonthsPercentage(reportJson.last3MonthsPercentageSummaryList);
      this.messageService.hideSpinner();
    }
  }

  public  searchInTable() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("datewiseSummaryReport");
    tr = table.getElementsByTagName("tr");

      for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.visibility = "";
          //tr[i].style.display = 'table-row';
        } else {
          tr[i].style.visibility = "collapse";

        }
      }
    }
  }

  private loadQuarterlyFailureSummary(summary: any): void {
       let quarterlyFailureSummaryObject: QuarterlyFailureSummary = null;
    for (const data in summary){
      quarterlyFailureSummaryObject = new QuarterlyFailureSummary();
      quarterlyFailureSummaryObject.quarter = summary[data].quarter;
      quarterlyFailureSummaryObject.fail_asim = summary[data].asim;
      quarterlyFailureSummaryObject.fail_compiler = summary[data].compiler;
      quarterlyFailureSummaryObject.fail_disasmstat = summary[data].disasmStat;
      quarterlyFailureSummaryObject.fail_json = summary[data].json;
      quarterlyFailureSummaryObject.fail_keiko = summary[data].keiko;
      quarterlyFailureSummaryObject.fail_lcat = summary[data].lcat;
      quarterlyFailureSummaryObject.fail_litsim = summary[data].litsim;
      quarterlyFailureSummaryObject.fail_ltftp = summary[data].ltftp;
      quarterlyFailureSummaryObject.fail_reader = summary[data].reader;
      quarterlyFailureSummaryObject.fail_rsim = summary[data].rsim;
      quarterlyFailureSummaryObject.fail_tdfdecode = summary[data].tdfDecode;
      quarterlyFailureSummaryObject.fail_x86 = summary[data].x86;
      this.quarterlyFailureSummaryList.push(quarterlyFailureSummaryObject);
    }
  }

  private loadHsdData(sightingObject: any): void {
    this.hsdSightings = new HSDSightings(sightingObject.bugsResolved, sightingObject.bugsReported, sightingObject.traceRequests);
    this.isDataReadyToDisplay = true;
    //this.messageService.hideSpinner();
  }

  private loadJiraConsolidation(jiraReportObject: any): void {
    this.jiraConsolidation = new  JiraConsolidation(jiraReportObject.tracingRequestsReceived,
      jiraReportObject.tracingRequestCompleted, jiraReportObject.pbtrequestReceived,
      jiraReportObject.pbtRequestCompleted)
  }

  private loadWeeklySummaryPerComponentPassorFail(summaryObject: any): any {
    let temp = this.loadWorkloadSummaryLast3Months(summaryObject);
    const componentSeen = {};
     this.groupsweeklySummary = temp.sort((a, b) => {
        const component = a.workload.localeCompare(b.workload);
        return component ? component : a.workload.localeCompare(b.workload);
      }).map(x => {
        const componentSpan = componentSeen[x.workload] ? 0 :
          temp.filter(y => y.workload === x.workload).length;

        componentSeen[x.workload] = true;

        return {...x, componentSpan};
      });
    return this.groupsweeklySummary;

  }

  private loadWeeklySuammryPassFail(summaryObject: any) {
    for (const summary in summaryObject) {
      this.weeklyComponentPassFailList.push(new WeeklyComponentPassFail(summaryObject[summary].startEndDate, summaryObject[summary].weeklyComponentPass, summaryObject[summary].weeklyComponentFail))
    }
  }

  private loadQuarterlySuammryPassFail(summaryObject: any) {
    for (const summary in summaryObject) {
      // tslint:disable-next-line:max-line-length
      this.quarterlyPassFailSummaryList.push(new TraceQuarterlyPassFailSummary(summaryObject[summary].quarter,
        summaryObject[summary].pass,
        summaryObject[summary].fail,summaryObject[summary].processing));
    }
  }

  private loadWorkloadSummaryLast3Months(summaryObject: any) : any {
    let overallSummaryPerComponent: OverallSummaryPerComponent = null;
     let overallSummaryPerComponentList: OverallSummaryPerComponent[] = []
    for (const summary in summaryObject) {
      overallSummaryPerComponent = new OverallSummaryPerComponent();
      overallSummaryPerComponent.date = summaryObject[summary].date;
      overallSummaryPerComponent.workload = summaryObject[summary].workload;
      overallSummaryPerComponent.totalTraces = summaryObject[summary].totalTraces;
      overallSummaryPerComponent.pass = summaryObject[summary].pass;
      overallSummaryPerComponent.fail = summaryObject[summary].fail;
      overallSummaryPerComponent.processing = summaryObject[summary].processing;
      overallSummaryPerComponent.fail_asim = summaryObject[summary].failAsim;
      overallSummaryPerComponent.fail_compiler = summaryObject[summary].failCompiler;
      overallSummaryPerComponent.fail_disasmstat = summaryObject[summary].failDisasmStat;
      overallSummaryPerComponent.fail_json = summaryObject[summary].failJson;
      overallSummaryPerComponent.fail_keiko = summaryObject[summary].failKeiko;
      overallSummaryPerComponent.fail_lcat = summaryObject[summary].failLcat;
      overallSummaryPerComponent.fail_litsim = summaryObject[summary].failLitsim;
      overallSummaryPerComponent.fail_ltftp = summaryObject[summary].failLtftp;
      overallSummaryPerComponent.fail_reader = summaryObject[summary].failReader;
      overallSummaryPerComponent.fail_rsim = summaryObject[summary].failRsim;
      overallSummaryPerComponent.fail_tdfdecode = summaryObject[summary].failTdfdecode;
      overallSummaryPerComponent.fail_x86 = summaryObject[summary].failX86;
      overallSummaryPerComponent.workloadComponent = summaryObject[summary].workload.split("_")[0];
      overallSummaryPerComponentList.push(overallSummaryPerComponent);
      //groups.set(summaryObject[summary].workload.split("_")[0] );
    }
    return overallSummaryPerComponentList;
  }

  private loadWorkloadSummaryLast3MonthsPercentage(summaryObject: any) : any {
    let overallSummaryPerComponent: OverallSummaryPerComponent = null;
    let overallSummaryPerComponentList: OverallSummaryPerComponent[] = []
    for (const summary in summaryObject) {
      overallSummaryPerComponent = new OverallSummaryPerComponent();
      overallSummaryPerComponent.workload = summaryObject[summary].workload;
      overallSummaryPerComponent.totalTraces = summaryObject[summary].totalTraces;
      overallSummaryPerComponent.pass = summaryObject[summary].passPercentage;
      overallSummaryPerComponent.fail = summaryObject[summary].failPercentage;
      overallSummaryPerComponent.processing = summaryObject[summary].processingPercentage;
      overallSummaryPerComponent.fail_asim = summaryObject[summary].failAsimPercentage;
      overallSummaryPerComponent.fail_compiler = summaryObject[summary].failCompilerPercentage;
      overallSummaryPerComponent.fail_disasmstat = summaryObject[summary].failDisasmStatPercentage;
      overallSummaryPerComponent.fail_json = summaryObject[summary].failJsonPercentage;
      overallSummaryPerComponent.fail_keiko = summaryObject[summary].failKeikoPercentage;
      overallSummaryPerComponent.fail_lcat = summaryObject[summary].failLcatPercentage;
      overallSummaryPerComponent.fail_litsim = summaryObject[summary].failLitsimPercentage;
      overallSummaryPerComponent.fail_ltftp = summaryObject[summary].failLtftpPercentage;
      overallSummaryPerComponent.fail_reader = summaryObject[summary].failReaderPercentage;
      overallSummaryPerComponent.fail_rsim = summaryObject[summary].failRsimPercentage;
      overallSummaryPerComponent.fail_tdfdecode = summaryObject[summary].failTdfdecodePercentage;
      overallSummaryPerComponent.fail_x86 = summaryObject[summary].failX86Percentage;
      overallSummaryPerComponent.workloadComponent = summaryObject[summary].workload.split("_")[0];
      overallSummaryPerComponentList.push(overallSummaryPerComponent);
      //groups.set(summaryObject[summary].workload.split("_")[0] );
    }
    return overallSummaryPerComponentList;
  }


  private loadOverallSummaryPerComponent(summaryObject: any) {
    let overallSummaryPerComponent: OverallSummaryPerComponent = null;

    for (const summary in summaryObject) {
      if (summaryObject[summary].workload != null) {
        overallSummaryPerComponent = new OverallSummaryPerComponent();
        overallSummaryPerComponent.workload = summaryObject[summary].workload;
        overallSummaryPerComponent.pass = summaryObject[summary].pass;
        overallSummaryPerComponent.fail_asim = summaryObject[summary].failAsim;
        overallSummaryPerComponent.fail_compiler = summaryObject[summary].failCompiler;
        overallSummaryPerComponent.fail_disasmstat = summaryObject[summary].failDisasmStat;
        overallSummaryPerComponent.fail_json = summaryObject[summary].failJson;
        overallSummaryPerComponent.fail_keiko = summaryObject[summary].failKeiko;
        overallSummaryPerComponent.fail_lcat = summaryObject[summary].failLcat;
        overallSummaryPerComponent.fail_litsim = summaryObject[summary].failLitsim;
        overallSummaryPerComponent.fail_ltftp = summaryObject[summary].failLtftp;
        overallSummaryPerComponent.fail_reader = summaryObject[summary].failReader;
        overallSummaryPerComponent.fail_rsim = summaryObject[summary].failRsim;
        overallSummaryPerComponent.fail_tdfdecode = summaryObject[summary].failTdfdecode;
        overallSummaryPerComponent.fail_x86 = summaryObject[summary].failX86;
        overallSummaryPerComponent.workloadComponent = summaryObject[summary].workload.split("_")[0];
      }
      this.overallSummaryPerComponentList.push(overallSummaryPerComponent);
    }
    const componentSeen = {};
    if (this.overallSummaryPerComponentList != null) {
      this.groups = this.overallSummaryPerComponentList.sort((a, b) => {
        const component = a.workloadComponent.localeCompare(b.workloadComponent);
        return component ? component : a.workloadComponent.localeCompare(b.workloadComponent);
      }).map(x => {
        const componentSpan = componentSeen[x.workloadComponent] ? 0 :
          this.overallSummaryPerComponentList.filter(y => y.workloadComponent === x.workloadComponent).length;

        componentSeen[x.workloadComponent] = true;

        return {...x, componentSpan};
      });
    }
  }


  public setViewFlagTraceSummaryReport() {
    if (this.overallSummaryPerComponentList.length === 0) {
      this.getTraceSummaryReport();
    }
    this.isDatewiseReportViewable = false;
    this.isTraceSummaryViewable = true;
  }

  public setViewFlagDatewiseReport() {
    this.isTraceSummaryViewable = false;
    this.isDatewiseReportViewable = true;
  }

  public search(startDate, endDate) {
    this.condensedReport = [];
	if(document.getElementById("searchInput") != null) {
	  (<HTMLInputElement>document.getElementById("searchInput")).value="";
	}
    this.datewiseSummaryComponentList = [];
    if (this.fromDate !== undefined && this.toDate !== undefined) {
      this.isQuartelyDatewiseView = false;
      this.messageService.showSpinner();
      const subscription = this.dataService.getTraceSummaryDatewiseReport(this.fromDate, this.toDate).subscribe(res => {
        // -----------------------------------------------------------------------------------------------
        this.messageService.searchCompleted(res)
        this.loadDatewiseSummary(JSON.stringify(res.data.datewiseSummaryReport));
        this.loadCondensedReportData(JSON.stringify(res.data.condensedReport));
      });
      // -----------------------------------------------------------------------------------------------
    }
    else if (this.start !== undefined && this.end !== undefined) {
      this.messageService.showSpinner();
      const subscription = this.dataService.getTraceSummaryDatewiseReport(startDate, endDate).subscribe(res => {
        // -----------------------------------------------------------------------------------------------
        this.messageService.searchCompleted(res)
        this.loadDatewiseSummary(JSON.stringify(res.data.datewiseSummaryReport));
        this.loadCondensedReportData(JSON.stringify(res.data.condensedReport));
      });
      // -----------------------------------------------------------------------------------------------
    }
  }

  private loadDatewiseSummary(responseData: string) {
    const summary: any = JSON.parse(responseData);
    let datewiseSummaryComponent: DatewiseSummaryComponent = null;
    for (const data in summary){
      datewiseSummaryComponent = new DatewiseSummaryComponent();
      datewiseSummaryComponent.startdate = summary[data].startdate;
      datewiseSummaryComponent.enddate = summary[data].enddate;
      datewiseSummaryComponent.totalTraces = summary[data].totalTraces;
      datewiseSummaryComponent.totalPassing = summary[data].totalPassing
      datewiseSummaryComponent.totalFailing = summary[data].totalFailing;
      datewiseSummaryComponent.totalOthers = summary[data].totalOthers;
      datewiseSummaryComponent.qtx86TrimFailed = summary[data].qtx86TrimFailed;
      datewiseSummaryComponent.litsimFailed = summary[data].litsimFailed;
      datewiseSummaryComponent.ddr3ParserFailed = summary[data].ddr3ParserFailed;
      datewiseSummaryComponent.qtx86noasFailed = summary[data].qtx86noasFailed;
      datewiseSummaryComponent.keikoFailed = summary[data].keikoFailed;
      datewiseSummaryComponent.qtStatsimLcatFailed = summary[data].qtStatsimLcatFailed
      datewiseSummaryComponent.lcatFailed = summary[data].lcatFailed;
      datewiseSummaryComponent.compilerFailed = summary[data].compilerFailed;
      datewiseSummaryComponent.x86Failed = summary[data].x86Failed;
      datewiseSummaryComponent.tdfdecodeFailed = summary[data].tdfdecodeFailed;
      datewiseSummaryComponent.readerFailed = summary[data].readerFailed;
      datewiseSummaryComponent.parserFailed = summary[data].parserFailed;
      datewiseSummaryComponent.symprofFailed = summary[data].symprofFailed;
      datewiseSummaryComponent.ptdumpFailed = summary[data].ptdumpFailed;
      datewiseSummaryComponent.trimFailed = summary[data].trimFailed;
      datewiseSummaryComponent.disasmstatFailed = summary[data].disasmstatFailed;
      datewiseSummaryComponent.rsimFailed = summary[data].rsimFailed;
      datewiseSummaryComponent.asimFailed = summary[data].asimFailed;
      datewiseSummaryComponent.ltftpFailed = summary[data].ltftpFailed;
      datewiseSummaryComponent.jsonFailed = summary[data].jsonFailed;
      datewiseSummaryComponent.xedFailed = summary[data].xedFailed;
      datewiseSummaryComponent.nonpipelineFailure = summary[data].nonPipelineFailures;
      this.datewiseSummaryComponentList.push(datewiseSummaryComponent);
    }
    this.messageService.hideSpinner();
  }

    private loadCondensedReportData(responseData: string) {
   let condensedReportData: TracewiseCondensedSummaryComponent = null;
    const summary: any = JSON.parse(responseData);
    for (const data in summary) {
      condensedReportData = new TracewiseCondensedSummaryComponent();
      condensedReportData.componentName = summary[data].componentName;
      condensedReportData.failCount = summary[data].failCount;
      condensedReportData.passKeikoX86 = summary[data].passKeikoX86;
      condensedReportData.lcatFail = summary[data].lcatFail
      condensedReportData.litsimFail = summary[data].litsimFail;
      condensedReportData.x86Fail = summary[data].x86Fail;
      condensedReportData.tdfdecodeFail = summary[data].tdfdecodeFail;
      condensedReportData.keikoFail = summary[data].keikoFail
      condensedReportData.archStudy = summary[data].archStudy
      condensedReportData.projStudy = summary[data].projStudy
      condensedReportData.cpiArchBinCoverage = summary[data].cpiArchMetricBinCoverage
      condensedReportData.mpiArchBinCoverage = summary[data].mpiArchMetricBinCoverage
      condensedReportData.branchesArchCoverage = summary[data].branchesArchMetricBinCoverage
      condensedReportData.cpiProjBinCoverage = summary[data].cpiProjMetricBinCoverage
      condensedReportData.mpiProjBinCoverage = summary[data].mpiProjMetricBinCoverage
      condensedReportData.branchesProjCoverage = summary[data].branchesProjMetricBinCoverage;
      condensedReportData.cpiCoverage = summary[data].cpiCoverage

      this.condensedReport.push(condensedReportData);
     
    }
	 this.condensedReport.sort((a, b) => {
        const component = a.componentName.localeCompare(b.componentName);
        return component ? component : a.componentName.localeCompare(b.componentName);
      });
   }

  public refreshTraceSummaryReport() {
    this.isHsdView = false;
    this.isJiraView = false;
    this.isWeeklyComponentPassFail = false;
    this.isWeeklySummaryPerComponent = false;
    this.isQuarterlyPassFailSummary = false;
    this.isWorkloadSummaryPerComponent = false;
    this.isQuarterlyFailureSummary = false;
    this.isWorkloadSummaryPercentagePerComponent = false;
    this.isOverAllSummary = false;
    this.weeklyComponentPassFailList = [];
    this.quarterlyPassFailSummaryList = [];
    this.weeklySummaryPerComponentList = [];
    this.overallSummaryPerComponentList = [];
    this.datewiseSummaryComponentList = [];
    this.hsdSightings = null;
    this.getTraceSummaryReport();
  }
  public collapseContent(component: string) {
    const hideStatus: boolean = document.getElementById("expand_" + component).hidden;
    if ( hideStatus === false ) {
      $("[id=" + component + "]").hide();
    }
    else {
      $("[id=" + component + "]").show();
    }
    document.getElementById("collapse_" + component).hidden = hideStatus;
    document.getElementById("expand_" + component).hidden = !hideStatus;
   }

  public viewCondensedDatewiseReport(): void {
    this.isDetailedDateReport = false;
    this.isCondensedDateReport = true;
    if (this.condensedReport.length === 0) {
      this.getLastQuarterData();
    }
  }

  public viewDetailedDatewiseReport(): void {
    this.isCondensedDateReport = false;
    this.isDetailedDateReport = true;
  }

  public resetDatewiseReport(): void {
    this.datewiseSummaryComponentList = [];
  }

  public getLastQuarterData() {
    if (this.datewiseSummaryComponentList.length === 0) {
    const quarter = (Math.floor((this.todaysDate.getMonth() - 1) / 3)) + 1;
    const start_month = (quarter-1) * 3 - 3;
    this.start = new Date(this.todaysDate.getFullYear(), start_month, 1);
    this.end = new Date(this.todaysDate.getFullYear(), start_month + 2, new Date(this.todaysDate.getFullYear(), start_month + 1, 0).getDate());
    this.search(this.start.getFullYear() + "-" + (this.start.getMonth() + 1) + "-" + this.start.getDate(), this.end.getFullYear() + "-" + (this.end.getMonth() + 1) + "-" + this.end.getDate());
    this.isDetailedDateReport = true;
    this.isCondensedDateReport = false;
    this.dateDataView = "detailedview";
    this.isQuartelyDatewiseView = true;
    }
  }
}
