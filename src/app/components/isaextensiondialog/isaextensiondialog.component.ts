import {Modal} from "angular2-modal/plugins/bootstrap";
import {MessageService} from "../../services/app.messageservice";
import {IsaExtensionModalContext} from "./isaextensiondialog.modalcontext";
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {CloseGuard, DialogRef, ModalComponent} from "angular2-modal";
import {PieChartConfig} from "../dashboard/models/PieChartConfig";
import {SummaryByIsa} from "../dashboard/models/dashboard.summarybyisa";

@Component({
  selector: "app-isaextensiondialog",
  templateUrl: "./isaextensiondialog.component.html",
  styleUrls: ["../../app.component.css"],
  providers: [],
  encapsulation : ViewEncapsulation.None
})

export class IsaExtensionDialogComponent implements OnInit, CloseGuard, ModalComponent<IsaExtensionModalContext> {
  private nodeData: any;
  private modal: Modal;
  public dataTableReady: boolean;
  private messageService: MessageService;
  public dialog: DialogRef<IsaExtensionModalContext>;
  public isaData: SummaryByIsa[];

  public title: string;
  public summaryData: any[];
  public configSummary: PieChartConfig;
  public elementIdSummary: string;
  public doughnutChartType: string;
  public isWeighted: boolean;
  public hasComponent: boolean;

  constructor(messageService: MessageService, dialog: DialogRef<IsaExtensionModalContext>, modal: Modal) {
    this.nodeData = null;
    this.isaData = [];
    this.summaryData = [];
    this.modal = modal;
    this.dataTableReady = false;
    this.messageService = messageService;
    this.dialog = dialog;
  }

  public ngOnInit(): void {
    this.nodeData = this.dialog.context.isaextensions;
    this.isWeighted = this.dialog.context.weighted;
    this.loadTitles();
    this.loadTableAndChart();
    this.dataTableReady = true;
  }

  private loadTitles() {
    if (this.nodeData.data.Workload) {
      this.hasComponent = false;
      this.isaData.push(new SummaryByIsa(this.nodeData.data.Workload, "", "", null, null));
    } else if (this.nodeData.data.Component) {
      this.hasComponent = true;
      this.isaData.push(new SummaryByIsa(this.nodeData.parent.data.Workload, this.nodeData.data.Component, "", null, null));
    }
  }

  private loadTableAndChart() {
    if (this.isWeighted) {
      this.title = "Weighted ISA extensions chart";
      this.summaryData.push(["ISA Extension", "Weighted Percentage"]);
      for (let children of this.nodeData.children) {
        let weighted = +children.data.WeightedPercentage; // Add a plus sign to cast a string to a number
        if(weighted > 0) {
          this.summaryData.push([children.data.IsaExtension, weighted]); // Load weighted chart
        }
        this.isaData.push(new SummaryByIsa("", "", children.data.IsaExtension, null, weighted)); // Load summary table
      }
    } else {
      this.title = "Unweighted ISA extensions chart";
      this.summaryData.push(["ISA Extension", "Unweighted Percentage"]);
      for (let children of this.nodeData.children) {
        let unweighted = +children.data.UnweightedPercentage; // Add a plus sign to cast a string to a number
        if(unweighted > 0) {
          this.summaryData.push([children.data.IsaExtension, unweighted]); // Load unweighted chart
        }
        this.isaData.push(new SummaryByIsa("", "", children.data.IsaExtension, unweighted, null)); // Load summary table
      }
    }

    this.doughnutChartType = "doughnut";
    this.configSummary = new PieChartConfig("", 0);
    this.elementIdSummary = "isaPieChart";
  }
}
