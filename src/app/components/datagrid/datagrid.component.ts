import {Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild} from "@angular/core";
import {TraceAttribute} from "app/models/app.traceattribute";
import {ResultsRaw} from "./models/datagrid.resultsraw";
import {MessageService} from "../../services/app.messageservice";
import {Subscription} from "rxjs/Subscription";
import {SearchData} from "app/models/app.searchdata";
import {AppEmonEdpData} from "../../models/app.emonedpdata";
import {AppUtilities} from "../../app.utilities";
import {Constants} from "../../models/app.constants";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MenuItem, DataTable, LazyLoadEvent, FilterMetadata} from "primeng/primeng";
import {TraceAttributeGroup} from "../../models/app.traceattributegroup";
import {Query} from "../searchbox/models/searchbox.query";
import {AvailableField} from "../searchbox/models/searchbox.availablefield";
import {AvailableFieldsController} from "../searchbox/controllers/searchbox.availablefieldscontroller";
import {QueryController} from "../searchbox/controllers/searchbox.querycontroller";
import {SearchExportRequest} from "../../models/app.searchexportrequest";
import {SearchResultsProvider} from "./services/datagrid.searchresultsprovider";
import {Router} from "@angular/router";
import {ConfirmationService} from "../../../../node_modules/primeng/primeng";


@Component({
  selector: 'datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.css'],
  providers: [ConfirmationService],
  encapsulation: ViewEncapsulation.None
})

export class DataGridComponent implements OnInit, OnDestroy {
  public availableFieldsController: AvailableFieldsController;
  public aimpactQueryController: QueryController;
  public selectedResult: ResultsRaw;
  public executedQuery: Query;
  public fields: AvailableField[];
  private selectedAttributes: TraceAttribute[];
  private messageService: MessageService;
  private searchCompletedSubscription: Subscription;
  private exportResultsSubscription: Subscription;
  private exportTlistSubscription: Subscription;
  private dataService: TraceDataService;
  private modal: Modal;
  public items: MenuItem[];
  private appEmonEdpData: AppEmonEdpData;
  private searchQuery: SearchData;
  public searchResultsProvider: SearchResultsProvider;
  private router: Router;

  @ViewChild('dt') dt: DataTable;

  constructor(router: Router, dataService: TraceDataService, messageService: MessageService, modal: Modal, confirmationService: ConfirmationService) {
    this.router = router;
    this.availableFieldsController = new AvailableFieldsController();
    this.aimpactQueryController = new QueryController(this.availableFieldsController);
    this.dataService = dataService;
    this.messageService = messageService;
    this.modal = modal;
    this.searchResultsProvider = new SearchResultsProvider(dataService, messageService, confirmationService)
  }

  ngOnInit(): void {
    this.searchCompletedSubscription = this.messageService.getQueryBroadcasted().subscribe(searchData => this.onQueryBroadcasted(searchData));
    this.exportResultsSubscription = this.messageService.getExportResults().subscribe(() => this.onExportResults());
    this.exportTlistSubscription = this.messageService.getExportTlist().subscribe(() => this.onExportTlist());
  }

  loadSearchLazy(event: LazyLoadEvent) {
    if (this.searchQuery !== undefined && this.searchResultsProvider.searchTotalRecords !== -1) {
      let page = (event.first / event.rows);
      let pageSize = event.rows;
      let sortField = event.sortField;
      let sortOrder = event.sortOrder;
      this.searchResultsProvider.fetchQueryResult(this.searchQuery, page, pageSize, this.selectedAttributes,false, event.filters, sortOrder, sortField);
    }
  }

  public onTraceSelected(event) {
    this.items = [
      {
        label: 'Show similar traces', icon: 'fa-search',
        command: (event) => this.showSimilarTraces(this.selectedResult),
        disabled: !this.isTraceValidForSimilarSearch(event.data)
      }
    ];
  }

  private isTraceValidForSimilarSearch(resultsRaw: ResultsRaw): boolean {
    let validTrace = resultsRaw.keiko_cpi != Constants.NOT_AVAILABLE && resultsRaw.keiko_l1mpi != Constants.NOT_AVAILABLE &&
      resultsRaw.keiko_l2mpi != Constants.NOT_AVAILABLE && resultsRaw.keiko_llcmpi != Constants.NOT_AVAILABLE;
    return validTrace;
  }

  private showSimilarTraces(resultRaw: ResultsRaw) {
    if (!this.isTraceValidForSimilarSearch(resultRaw)) {
      return;
    }
    this.dataService.searchLike(resultRaw.traceName).subscribe(data => {
      // This searchData is not used right now, maybe later
      // let searchData = new SearchData(resultRaw.traceName, this.selectedAttributes);
      this.messageService.searchCompleted(data);
    });
  }

  private onQueryBroadcasted(searchData: SearchData) {
    this.dt.reset();
    this.searchResultsProvider.clearCache();

    this.searchQuery = searchData;
    this.selectedAttributes = this.searchQuery.traceAttributes;
    this.fields = this.searchQuery.fields;
    this.executedQuery = this.searchQuery.query;

    let page = 0;
    let pageSize = this.dt.rows;
    let sortField = "";
    let sortOrder = 1;

    this.searchResultsProvider.fetchQueryResult(this.searchQuery, page, pageSize,this.selectedAttributes,this.shouldShowInstructionDetails(), undefined, sortOrder, sortField);
  }

  public showColumn(columnName: String): boolean {
    if (columnName == "isaPercentage" && this.searchQuery != null && this.searchQuery.query.toString().includes("isaPercentage")) {
      return true;
    }
    else if (this.selectedAttributes == null)
      return false;
    return this.selectedAttributes.filter(a => a.value == columnName).length > 0;
  }

  public shouldShowInstructionDetails(): boolean {
    return this.showColumn("instruction");
  }

  public showDetails(traceName: string) {
    this.messageService.showDetailsWindow(traceName);
  }

  public shouldShowLtFootPrintContent(): boolean {
    if (this.selectedAttributes == null)
      return false;
    return this.selectedAttributes.filter(attribute => attribute.getAttributeGroup() == TraceAttributeGroup.Func).length > 0;
  }

  public showLtFootPrintContent(traceName: string) {
    this.messageService.showLtFootPrintDetailsWindow(traceName);
  }

  public showEmonEdpWindow(configurationName: string, traceName: string) {
    this.appEmonEdpData = new AppEmonEdpData(traceName, configurationName);
    // this.messageService.showEmonEdpWindow(this.appEmonEdpData);
    // this.router.navigate(["/edpdashboard"], { queryParams: { emon_edp_data: this.appEmonEdpData } });
    this.router.navigate(["/edpdashboard"], {queryParams: {trace: traceName, config: configurationName}});
  }

  public showLcatChartDialog(traceName: string) {
    this.messageService.showSpinner();
    this.dataService.getLCATChartData(traceName).subscribe(result => {
      this.messageService.showLcatChartDetailsDialog(result);
      this.messageService.hideSpinner();
    });
  }

  private onExportResults() {
    let headers: string[] = ["workload", "component", "traceName"];
    let isInstructionsIncluded: boolean = this.shouldShowInstructionDetails();
    let input = this.searchQuery.input;

    let request = new SearchExportRequest(input, isInstructionsIncluded,null);

    this.dataService.exportSearch(request).subscribe(result => {
      let traces = result.data;
      let content = this.getCSVContent(traces, headers);
      AppUtilities.downloadFile("search_result.csv", content);
      this.messageService.exportResultsCompleted();
    });
  }

  private getCSVContent(traces: any, headers: string[]): string {
    const workloadHeaderMsg = " (HSD link is not available)";
    let hsdTraceAttribute = "HSD";
    // Remove EDP Emon from export as it was requested by Product Owner, iscr3sharedamongthreads
    let selectedAttributes = this.selectedAttributes.filter(item => item.value !== "edp_emon" && item.value !== "iscr3sharedamongthreads")
    let content: string = headers.join(",") + "," + selectedAttributes.map(a => a.value).join(",");
    content += "\n";

    content = content.replace("workload", "workload (click below for more details)");
    for (let trace of traces) {
      let rawTrace = new ResultsRaw(trace);
      for (let header of headers) {
        let hsdValue = rawTrace[hsdTraceAttribute];
        if ( header === "workload" ) {
          if ( hsdValue !== ResultsRaw.HSD_NOT_AVAILABLE ) {
            content += "\"=HYPERLINK(\"\"" + rawTrace[hsdTraceAttribute] + "\"\", \"\"" + rawTrace[header] + "\"\")\"" + ",";
          } else {
            content += rawTrace[header] + workloadHeaderMsg + ",";
          }
        } else {
          content += rawTrace[header] + ",";
        }
      }
      for (let attribute of selectedAttributes) {
        let value = "";

        let attributeValue = this.normalizeValue(attribute.value);
        if (attributeValue != null) {
          if ( attributeValue !== hsdTraceAttribute ) { // In order to remove HSD from report header
            value = rawTrace[attributeValue];
          }
        }
        content += value + ",";
      }
      content += "\n";
    }
    return content;
  }

  private normalizeValue(value: string): string {
    if (value === "func_code-footprint-kb") {
      return "func_code_footprint";
    }
    if (value === "func_cpl-trans") {
      return "func_cpl_trans";
    }
    if (value === "func_cr3-trans") {
      return "func_cr3_trans";
    }
    if (value === "func_data-footprint-kb") {
      return "func_data_footprint";
    }
    if (value === "func_irqs") {
      return "func_irqs";
    }
    if (value === "func_page-faults") {
      return "func_page_faults";
    }
    if (value === "trace_list") {
      return "traceList";
    }
    if (value === "instruction_weight") {
      return "instructionWeight";
    }
    if (value === "edp_emon") {
      return "emonConfigurations";
    }
    if (value === "study_list") {
      return "studyList";
    }
    if (value === "instructionsrepresented") {
      return "instructionsRepresented";
    }
    if (value === "cyclesrepresented") {
      return "cyclesRepresented";
    }
    if (value === "cr3shareddata") {
      return "cr3SharedDatas";
    }
    if (value === "lockinstructions") {
      return "lockInstruction";
    }
    if (value === "lcatdata") {
      return "isLcatImpactDisplay";
    }
    return value;
  }

  private onExportTlist() {
    let isInstructionsIncluded: boolean = false;
    let input = this.searchQuery.input;
    let request = new SearchExportRequest(input, isInstructionsIncluded,null);

    this.messageService.showSpinner();
    this.dataService.exportSearch(request).subscribe(result => {
      let tlistContent = "";
      for (let trace of result.data) {
        tlistContent += Constants.TRACE_PREFIX + trace.tracePath + "/" + trace.traceName + "\n";
      }
      AppUtilities.downloadFile("trace.tlist", tlistContent);
      this.messageService.hideSpinner();
    });
  }

  public ngOnDestroy(): void {
    if (this.searchCompletedSubscription) {
      this.searchCompletedSubscription.unsubscribe();
    }
    if (this.exportResultsSubscription) {
      this.exportResultsSubscription.unsubscribe();
    }
    if (this.exportTlistSubscription) {
      this.exportTlistSubscription.unsubscribe();
    }
  }

}
