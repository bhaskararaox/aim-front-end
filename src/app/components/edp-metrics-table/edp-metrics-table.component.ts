import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {AppEmonEdpData} from "../../models/app.emonedpdata";
import {AppEmonTableData} from "../../models/app.emontabledata";
import {DataTable} from "../../../../node_modules/primeng/primeng";
import {AppEmonMetricData} from "../../models/app.emonmetricdata";
import {EDPSampleModel} from "../edpsamplechart/model/EDPSampleModel";
import {ChartConfig} from "../edpsamplechart/model/chartConfig";
import {GooglechartsComponent} from "../edpsamplechart/googlecharts/googlecharts.component";

@Component({
  selector: "edp-metrics-table",
  templateUrl: "./edp-metrics-table.component.html",
  styleUrls: ["./edp-metrics-table.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class EdpMetricsTableComponent implements OnInit {

  @Input() trace: string;
  @Input() workload: string;

  public chartList: EDPSampleModel[];

  public cores = [];
  public sockets = [];
  public packages = [];

  public tableData: any[] = [];
  public tableHasData = false;
  public tableElements: any[] = [];

  public selectedCore: any;
  public selectedSocket: any;
  public selectedPackage: any;

  @ViewChild("dtMetrics") dtMetrics: DataTable;
  @ViewChild(GooglechartsComponent) googleChart: GooglechartsComponent;

  public dataService: TraceDataService;
  public messageService: MessageService;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.initComponent();
  }

  public showErrorMessage(summary: string, detail: string) {
    this.messageService.showErrorMessage(summary, detail);
  }

  private initComponent() {
    this.cores = [];
    this.sockets = [];
    this.packages = [];
    this.tableData = [];
    this.tableElements = [];
    this.tableHasData = false;

    const appEmonEdpData = new AppEmonEdpData(this.trace, this.workload);
    this.messageService.showSpinner();
    this.dataService.getEDPSampleChartComboboxData(appEmonEdpData).subscribe(result => {
      if (result != null) {
        this.loadAllComboBoxData(result);
      }
      this.messageService.hideSpinner();
    });

    this.updateTable(0, 0, 0);
  }

  private loadAllComboBoxData(edpData: any) {
    const coresValues = edpData.data.cores;
    const socketsValues = edpData.data.sockets;
    const packagesValues = edpData.data.packages;

    this.validateFilterData(coresValues, socketsValues, packagesValues);

    for (let x = 0; x < coresValues.length; x++) {
      this.cores.push({label: coresValues[x].toString(), value: coresValues[x].toString()});
    }

    for (let x = 0; x < socketsValues.length; x++) {
      this.sockets.push({label: socketsValues[x].toString(), value: socketsValues[x].toString()});
    }

    for (let x = 0; x < packagesValues.length; x++) {
      this.packages.push({label: packagesValues[x].toString(), value: packagesValues[x].toString()});
    }

    this.setDropDownDefaults();
  }

  private validateFilterData(coresValues, socketsValues, packagesValues) {
    if (coresValues === undefined || coresValues === null || coresValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Cores data");
    }

    if (socketsValues === undefined || socketsValues === null || socketsValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Sockets data");
    }

    if (packagesValues === undefined || packagesValues === null || packagesValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Packages data");
    }
  }

  private setDropDownDefaults() {
    if (this.cores && this.cores.length > 0) {
      this.selectedCore = this.cores[0].value;
    }

    if (this.sockets && this.sockets.length > 0) {
      this.selectedSocket = this.sockets[0].value;
    }

    if (this.packages && this.packages.length > 0) {
      this.selectedPackage = this.packages[0].value;
    }
  }

  public hasSelectedData() {
    return this.selectedCore && this.selectedSocket && this.selectedPackage;
  }

  public updateTable(selectedCore?: number, selectedSocket?: number, selectedPackage?: number): void {
    this.chartList = [];
    const selectedCoreVal = this.isNullOrUndefined(selectedCore) ? parseInt(this.selectedCore, 10) : selectedCore;
    const selectedSocketVal = this.isNullOrUndefined(selectedSocket) ? parseInt(this.selectedSocket, 10) : selectedSocket;
    const selectedPackageVal = this.isNullOrUndefined(selectedPackage) ? parseInt(this.selectedPackage, 10) : selectedPackage;

    const selectedCoresArray: number[] = [];
    selectedCoresArray.push(selectedCoreVal);

    const selectedSocketsArray: number[] = [];
    selectedSocketsArray.push(selectedSocketVal);

    const selectedPackageArray: number[] = [];
    selectedPackageArray.push(selectedPackageVal);

    const filterData = new AppEmonEdpData(this.trace, this.workload,
      null, selectedSocketsArray, selectedCoresArray, selectedPackageArray);

    this.messageService.showSpinner();
    this.resetTable();
    this.dataService.getEDPPerformanceMetricTableData(filterData).subscribe(result => {
      if (result != null) {
        this.loadMetricTable(result);
      }
      this.messageService.hideSpinner();
    });
  }

  private isNullOrUndefined(item: any) {
    return (item == null || item === undefined);
  }

  private resetTable() {
    if (this.dtMetrics !== undefined && !this.dtMetrics.isEmpty()) {
      this.dtMetrics.reset();
    }
  }

  public loadMetricTable(result: any): void {
    const data = [];
    if (result.data) {

      this.tableData = result.data.metricTableData;

      for (let i = 0; i < this.tableData.length; i++) {

        const rsquared = parseFloat(this.tableData[i].rSquaredData).toFixed(3);
        const pearson = parseFloat(this.tableData[i].pearsonData).toFixed(3);
        const frequency = parseFloat(this.tableData[i].frequencyData).toPrecision(3);

        data.push(new AppEmonTableData(this.tableData[i].metric, this.tableData[i].correlationData,
          rsquared, pearson, frequency));
      }
    }
    this.tableHasData = data.length > 0;
    this.tableElements = data;
  }

  public displayScatterPlot(selectedMetric: string) {
    const metricObj = this.getSelectedTableObject(selectedMetric);
    const correlationData: AppEmonMetricData[] = metricObj.correlationData;
    const plotData = this.getScatterPlotData(correlationData, selectedMetric);

    if (plotData.length > 1) {
      this.chartList = [];
      const chart = new EDPSampleModel(plotData,
        new ChartConfig("trendLine", false, " CPI in Y Axis VS " + selectedMetric + " in X Axis",
          selectedMetric, "CPI", "none", true, 90),
        "divChart");
      this.chartList.push(chart);
    } else {
      this.chartList = [];
      this.showErrorMessage("Graph Plot Error", "Insufficient data, graph cannot be plotted");
    }
  }

  private getScatterPlotData(correlationData: AppEmonMetricData[], selectedMetric: string) {
    const plotData = [];
    let dataPair = [];

    const dataPairStr = [selectedMetric, "CPI" ];
    plotData.push(dataPairStr);

    for (let i = 0; i < correlationData.length; i += 2) {
      if (correlationData[i].metric === "CPI") {
        dataPair = [correlationData[i + 1].value, correlationData[i].value];
      } else {
        dataPair = [correlationData[i].value, correlationData[i + 1].value];
      }
      plotData.push(dataPair);
    }

    return plotData;
  }

  public displayTimePlot(selectedMetric: string) {
    const metricObj = this.getSelectedTableObject(selectedMetric);
    const correlationData: AppEmonMetricData[] = metricObj.correlationData;
    const plotData = this.getTimeLinePlotData(correlationData, selectedMetric);

    if (plotData.length > 1) {
      this.chartList = [];
      const chart = new EDPSampleModel(plotData,
        new ChartConfig("LineChart", false, " CPI  VS " + selectedMetric + " in time", "Time", "Normalized Metric Value",  "none", true, 90),
        "divChart");
      this.chartList.push(chart);
    } else {
      this.chartList = [];
      this.showErrorMessage("Graph Plot Error", "Insufficient data, graph cannot be plotted");
    }
  }

  private getTimeLinePlotData(correlationData: AppEmonMetricData[], selectedMetric: string) {
    const plotData = [];
    let dataTriplet = [];

    const dataTripletStr = ["Timestamp", "CPI", selectedMetric];
    plotData.push(dataTripletStr);

    const timestamps = this.getTimeStampsFromData(correlationData);
    const [cpiMin, cpiMax] = this.getMinMaxFromMetricValues(correlationData, "CPI");
    const [metricMin, metricMax] = this.getMinMaxFromMetricValues(correlationData, selectedMetric);

    let k = 0;
    timestamps.forEach((value) => {
      for (let j = k; j < correlationData.length; j += 2) {
        if (correlationData[j].timestamp === value && correlationData[j + 1].timestamp === value) {
          if (correlationData[j].metric === "CPI") {
            dataTriplet = [value, this.getNormalizeValue(correlationData[j].value, cpiMin, cpiMax),
              this.getNormalizeValue(correlationData[j + 1].value, metricMin, metricMax)];
          } else {
            dataTriplet = [value, this.getNormalizeValue(correlationData[j + 1].value, cpiMin, cpiMax),
              this.getNormalizeValue(correlationData[j].value, metricMin, metricMax)];
          }
          plotData.push(dataTriplet);
          k = j + 2;
          break;
        }
      }
    });
    return plotData;
  }

  private getNormalizeValue(value: number, metricMin: number, metricMax: number) {
    return (value - metricMin) / (metricMax - metricMin);
  }

  private getMinMaxFromMetricValues(correlationData: AppEmonMetricData[], selectedMetric: string) {
    const cpiValues = [];
    for (let i = 0; i < correlationData.length; i++) {
      if (correlationData[i].metric === selectedMetric) {
        cpiValues.push(correlationData[i].value);
      }
    }
    const minCPIValues = Math.min(...cpiValues);
    const maxCPIValues = Math.max(...cpiValues);
    return [minCPIValues, maxCPIValues];
  }

  private getTimeStampsFromData(correlationData: AppEmonMetricData[]) {
    const timestamps = new Set();
    for (let i = 0; i < correlationData.length; i++) {
      timestamps.add(correlationData[i].timestamp);
    }
    return timestamps;
  }

  private getSelectedTableObject(selectedMetric: string): any {
    let selectedTableMetric = null;

    if (this.tableData) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].metric === selectedMetric) {
          selectedTableMetric = this.tableData[i];
          break;
        }
      }
    }
    return selectedTableMetric;
  }
}