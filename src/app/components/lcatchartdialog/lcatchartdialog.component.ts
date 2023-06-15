import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {DialogRef, ModalComponent} from "angular2-modal";
import {LcatChartDialogModalContext} from "./lcatchartdialog.modalcontext";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {ChartConfig} from "../edpsamplechart/model/chartConfig";

@Component({
  selector: "app-lcatchartdialog",
  templateUrl: "./lcatchartdialog.component.html",
  styleUrls: ["./lcatchartdialog.component.css"],
  providers: [],
  encapsulation: ViewEncapsulation.None
})

export class LcatChartDialogComponent implements OnInit, ModalComponent<LcatChartDialogModalContext> {

  private dataService: TraceDataService;
  private messageService: MessageService;
  public dialog: DialogRef<LcatChartDialogModalContext>;
  private modal: Modal;
  public chartData: any[];
  public chartConfig: ChartConfig;
  public chartElementId: String;

  constructor(messageService: MessageService, dataService: TraceDataService, dialog: DialogRef<LcatChartDialogModalContext>, modal: Modal) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.dialog = dialog;
    this.modal = modal;
  }

  ngOnInit() {
    this.loadChart();
  }

  public loadChart() {
    const data = this.dialog.context.lcatdata.data;

    let matrixData: any  = [];
    const headers: any = [{label: "LitCount", type: "number"}, {label: "LCAT OFF: Trace run w. –lcat_enable 0", type: "number"}, {label: "LCAT ON: Trace run w. –lcat_enable 1", type: "number"}];
    const dataoff = data[0].data;
    const dataon = data[1].data;

    for (let i = 0; i < dataoff.length; i++) { // Adding LCAT OFF data
      matrixData.push([dataoff[i].litcount, dataoff[i].cpi, null]);
    }

    for (let i = 0; i < dataon.length; i++) { // Adding LCAT ON data
      if (matrixData[i] !== undefined && matrixData[i][0] === dataon[i].litcount) {
        matrixData[i][2] = dataon[i].cpi;     // If LitCount value is already in the matrix, adding LCAT-ON CPI value to it.
      } else {
        matrixData.push([dataon[i].litcount, null, dataon[i].cpi]); // If not, adding just LCAT-ON data (with LCAT-OFF CPI as null).
      }
    }

    matrixData.unshift(headers);

    this.chartData = matrixData;
    this.chartConfig = new ChartConfig("single", false, "", "Instructions Retired", "CPI",  "none",  true, 45);
    this.chartElementId = "lcatcpichart";
  }
}
