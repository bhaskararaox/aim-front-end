import {Modal} from 'angular2-modal/plugins/bootstrap';
import {MessageService} from "../../services/app.messageservice";
import {SummaryByComponent} from "../dashboard/models/dashboard.summarybycomponent";
import {ComponentModalContext} from "./componentdialog.modalcontext";
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {CloseGuard, DialogRef, ModalComponent} from "angular2-modal";
import {PieChartConfig} from "../dashboard/models/PieChartConfig";

@Component({
  selector: 'componentdialog',
  templateUrl: './componentdialog.component.html',
  styleUrls: ['../../app.component.css'],
  providers: [],
  encapsulation : ViewEncapsulation.None
})

export class ComponentDialogComponent implements OnInit, CloseGuard, ModalComponent<ComponentModalContext>{
  private nodeData: any;
  private modal : Modal;
  public dataTableReady: boolean;
  private messageService : MessageService;
  public dialog: DialogRef<ComponentModalContext>;
  public componentData: SummaryByComponent[];

  public summaryData: any[];
  public configSummary: PieChartConfig;
  public elementIdSummary: String;

  public doughnutChartType: string;
  public doughnutChartData: number[];
  public doughnutChartLabels: string[];

  constructor(messageService : MessageService, dialog: DialogRef<ComponentModalContext>, modal: Modal) {
    this.nodeData = null;
    this.modal = modal;
    this.dataTableReady = false;
    this.messageService = messageService;
    this.dialog = dialog;
    this.componentData = [];

    this.doughnutChartType = '';
    this.doughnutChartData = [];
    this.doughnutChartLabels = [];
  }

  public ngOnInit(): void {
    this.nodeData = this.dialog.context.components;
    this.loadTable();
    this.dataTableReady = true;
    this.loadChart();
  }

  private loadTable(){
    // First push the parent
    let parentnumTraces = +this.nodeData.data.NumTraces; // Add a plus sign to cast a string to a number
    this.componentData.push(new SummaryByComponent(this.nodeData.data.Workload, this.nodeData.data.NumComponents, "", parentnumTraces, this.nodeData.data.goldTraces,this.nodeData.data.silverTraces,this.nodeData.data.bronzeTraces,this.nodeData.data.segment));
    // Then push the children
    for (let children of this.nodeData.children) {
      let numberOfTraces = +children.data.NumTraces; // Add a plus sign to cast a string to a number
      this.componentData.push(new SummaryByComponent("", "", children.data.Component, numberOfTraces,children.data.goldTraces,children.data.silverTraces,children.data.bronzeTraces,children.data.segment));
    }
  }

  private loadChart(){
    let array = [];
    let chartData: SummaryByComponent[] = [];

    for (let children of this.nodeData.children) {
      let numberOfTraces = +children.data.NumTraces; // Add a plus sign to cast a string to a number
    //  chartData.push(new SummaryByComponent("", "", children.data.Component, numberOfTraces));
      chartData.push(new SummaryByComponent("", "", children.data.Component, numberOfTraces,0,0,0,""));
    }

    this.doughnutChartData = chartData.map(summaryByComponent => summaryByComponent.NumTraces).slice(0, 15);
    this.doughnutChartLabels = chartData.map(summaryByComponent => summaryByComponent.Component).slice(0, 15);

    array.push(['Workload', 'Traces']);
    for (let i = 0; i < this.doughnutChartData.length; i++) {
      array.push([this.doughnutChartLabels[i], this.doughnutChartData[i]]);
    }

    this.summaryData = array;
    this.doughnutChartType = 'doughnut';
    this.configSummary = new PieChartConfig('', 0);
    this.elementIdSummary = 'componentModelPieChart';
  }

  public beforeDismiss(): boolean | Promise<boolean> {
    return true;
  }

  public beforeClose(): boolean | Promise<boolean> {
    return true;
  }

}
