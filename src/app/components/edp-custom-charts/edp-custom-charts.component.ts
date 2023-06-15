import {Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {AppEmonEdpData} from "../../models/app.emonedpdata";
import {MessageService} from "../../services/app.messageservice";
import {TraceDataService} from "../../services/app.tracedataservice";
import {EDPSampleModel} from "../edpsamplechart/model/EDPSampleModel";
import {ChartConfig} from "../edpsamplechart/model/chartConfig";

@Component({
  selector: "edp-custom-charts",
  templateUrl: "./edp-custom-charts.component.html",
  styleUrls: ["./edp-custom-charts.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class EdpCustomChartsComponent implements OnInit {

  @Input() trace: string;
  @Input() workload: string;

  public cores = [];
  public metrics = [];
  public sockets = [];
  public packages = [];
  public chartsTypes = [];
  public trendLineMetrics = [];
  public cpiMetricNames = [];

  public selectedCore: any;
  public selectedMetric: any;
  public selectedSocket: any;
  public selectedPackage: any;
  public selectedChartType: any;
  public selectedTrendLineMetric: any;

  public chartList: EDPSampleModel[];

  public trendLineSelected: boolean;

  private dataService: TraceDataService;
  private messageService: MessageService;

  constructor(messageService: MessageService, dataService: TraceDataService) {
    this.dataService = dataService;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.cores = [];
    this.metrics = [];
    this.sockets = [];
    this.packages = [];
    this.chartsTypes = [];
    this.trendLineMetrics = [];
    this.trendLineSelected = false;
    this.chartList = [];
    this.loadComboBoxData();
  }

  public onCharTypesChange(event) {
    const selectedValue = event.value;
    if (selectedValue.chartype && selectedValue.chartype === "trendLine") {
      this.trendLineSelected = true;
    } else {
      this.trendLineSelected = false;
    }
  }

  public showErrorMessage(summary: string, detail: string) {
    this.messageService.showErrorMessage(summary, detail);
  }

  private loadComboBoxData() {
    const appEmonEdpData = new AppEmonEdpData(this.trace, this.workload);
    this.messageService.showSpinner();
    this.dataService.getEDPSampleChartComboboxData(appEmonEdpData).subscribe(result => {
      if (result != null) {
        this.fillUpComboBoxData(result);
      }
      this.messageService.hideSpinner();
    });
  }

  private fillUpComboBoxData(edpData: any) {
    const coresValues = edpData.data.cores;
    const metricValues = edpData.data.metrics;
    const socketsValues = edpData.data.sockets;
    const packagesValues = edpData.data.packages;

    this.validateFilterData(coresValues, metricValues, socketsValues, packagesValues);

    this.cpiMetricNames = this.getCPIMetricNames(metricValues);

    for (let x = 0; x < metricValues.length; x++) {
      this.metrics.push({label: metricValues[x].toString(), value: metricValues[x].toString()});
      if (!this.cpiMetricNames.includes(metricValues[x])) {
        this.trendLineMetrics.push({label: metricValues[x].toString(), value: metricValues[x].toString()});
      }
    }

    for (let x = 0; x < coresValues.length; x++) {
      this.cores.push({label: coresValues[x].toString(), value: coresValues[x].toString()});
    }

    for (let x = 0; x < socketsValues.length; x++) {
      this.sockets.push({label: socketsValues[x].toString(), value: socketsValues[x].toString()});
    }

    for (let x = 0; x < packagesValues.length; x++) {
      this.packages.push({label: packagesValues[x].toString(), value: packagesValues[x].toString()});
    }

    this.chartsTypes.push({label: "Samples", value: "samples"});
    this.chartsTypes.push({label: "Timestamp(s)", value: "timestamp"});

    for (let x = 0; x < this.cpiMetricNames.length; x++) {
      this.chartsTypes.push({
        label: this.cpiMetricNames[x] + " TrendLine",
        value: {metric: this.cpiMetricNames[x], chartype: "trendLine"}
      });
    }

    this.setDropDownDefaults();
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

    if (this.metrics && this.metrics.length > 0) {
      this.selectedMetric = this.metrics.slice(0, 1).map(a => a.value);
    }

    if (this.chartsTypes && this.chartsTypes.length > 0) {
      this.selectedChartType = this.chartsTypes[0].value;
    }

    if (this.trendLineMetrics && this.trendLineMetrics.length > 0) {
      this.selectedTrendLineMetric = this.trendLineMetrics[0].value;
    }
  }

  private validateFilterData(coresValues, metricValues, socketsValues, packagesValues) {
    if (coresValues === undefined || coresValues === null || coresValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Cores data");
    }

    if (metricValues === undefined || metricValues === null || metricValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Metrics data");
    }

    if (socketsValues === undefined || socketsValues === null || socketsValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Sockets data");
    }

    if (packagesValues === undefined || packagesValues === null || packagesValues.length === 0) {
      this.showErrorMessage("Data Error", "Cannot download Packages data");
    }
  }

  private getCPIMetricNames(metricValues: any[]) {
    const cpiNames = [];
    for (let x = 0; x < metricValues.length; x++) {
      if (metricValues[x].substring(0, 3) === "CPI") {
        cpiNames.push(metricValues[x]);
      }
    }
    return cpiNames;
  }

  public addChart() {
    let chartType = "trendLine";

    let metricsArray = [];
    if (this.trendLineSelected) {
      const metricFromChartSelected = this.selectedChartType.metric;
      metricsArray.push(this.selectedTrendLineMetric);
      metricsArray.push(metricFromChartSelected);
    } else {
      metricsArray = this.selectedMetric;
      chartType = this.selectedChartType;
    }
    const selectedCoresArray = [];
    selectedCoresArray.push(parseInt(this.selectedCore, 10));
    const selectedSocketsArray = [];
    selectedSocketsArray.push(parseInt(this.selectedSocket, 10));
    const selectedPackageArray = [];
    selectedPackageArray.push(parseInt(this.selectedPackage, 10));

    const appEmonEdpMetricData = new AppEmonEdpData(this.trace, this.workload,
      metricsArray, selectedSocketsArray, selectedCoresArray, selectedPackageArray);

    this.messageService.showSpinner();
    this.dataService.getEDPSampleChartMetricData(appEmonEdpMetricData).subscribe(result => {
      if (result != null) {
        const publishedDate = result.dataPublishedDate;
        const isSingleMetricChart = metricsArray !== null && metricsArray.length === 1;
        const chartData = this.formatChartData(result.data, metricsArray, chartType, isSingleMetricChart);

        if (chartData === null || chartData.length === 0) {
          this.showErrorMessage("Graph Plot Error", "Insufficient data, graph cannot be plotted");
        } else {
          let chartConfig;
          let title = "";
          let config = null;
          const tempCharList = this.chartList;
          this.chartList = [];
          switch (chartType) {
            case "samples":
              title = "Metrics in Y Axis VS Samples in X Axis, EDP Published Date: " + publishedDate;
              config = this.formatChartConfig(title, "Sample", metricsArray.join(","), chartType, !isSingleMetricChart);
              chartConfig = new EDPSampleModel(chartData, config, "divChartPanel" + this.chartList.length.toString());
              break;
            case "timestamp":
              title = "Metrics in Y Axis VS Timestamp(s) in X Axis, EDP Published Date: " + publishedDate;
              config = this.formatChartConfig(title, "Timestamp(s)", metricsArray.join(","), chartType, !isSingleMetricChart);
              chartConfig = new EDPSampleModel(chartData, config, "divChartPanel" + this.chartList.length.toString());
              break;
            default: // trendline
              title = "CPI in Y Axis VS " + this.selectedTrendLineMetric + " in X Axis, EDP Published Date: " + publishedDate;
              config = this.formatChartConfig(title, this.selectedTrendLineMetric, this.selectedChartType.metric, chartType, !isSingleMetricChart);
              chartConfig = new EDPSampleModel(chartData, config, "divChartPanel" + this.chartList.length.toString());
              break;
          }

          tempCharList.push(chartConfig);
          tempCharList.reverse();
          this.chartList = tempCharList;
        }
        this.messageService.hideSpinner();
      }
    });
  }

  private formatChartConfig(title: string, hAxisTitle: string, vAxisTitle: string, chartType: string,
                            isMultiLine: boolean): ChartConfig {
    return new ChartConfig(chartType, isMultiLine, title, hAxisTitle, vAxisTitle);
  }

  public deleteCharts() {
    this.chartList = [];
  }

  public removeChart(index: number) {
    if (this.chartList && index >= 0 && index < this.chartList.length) {
      this.chartList.splice(index, 1);
    }
  }

  public hasSomeCharts() {
    return this.chartList && this.chartList.length > 0;
  }

  public hasDataForPlotting() {
    let isActive =  false;
    if ( this.selectedChartType === "samples" ||  this.selectedChartType === "timestamp") {
      isActive =  this.selectedChartType && this.selectedCore && this.selectedSocket
        && this.selectedPackage && this.selectedMetric && this.selectedMetric.length > 0;
    } else {
      isActive =  this.selectedChartType && this.selectedCore && this.selectedSocket
        && this.selectedPackage && this.selectedTrendLineMetric;
    }
    return isActive;
  }

  private formatChartData(result: any[], metricsArray: any[], chartType: string, isSingleMetricChart: boolean): any[] {
    let charData;
    charData = this.createCorrelationMatrix(result, metricsArray, chartType !== "timestamp");
    if (chartType === "trendLine") {
      charData = this.applyTrendlineFormat(charData);
    } else { // samples or timestamp chart
      if (!isSingleMetricChart) {
        // Normalize
        charData = this.normalizeData(charData);
      }
    }
    return charData;
  }

  private createCorrelationMatrix(result: any[], metricsArray: any[], correlateBySample: boolean = true): any[] {
    const matrix = [];
    let cleanMatrix = [];

    // add headers
    matrix[0] = [];
    correlateBySample ? matrix[0].push("sample") : matrix[0].push("timestamp");
    for (let i = 0; i < metricsArray.length; i++) {
      matrix[0].push(metricsArray[i]);
    }
    const headers = matrix[0];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < headers.length; j++) {
        let matrixRow = [];
        const sampleIndex = result[i].sample;
        if (matrix[sampleIndex] !== undefined && matrix[sampleIndex] !== null) {
          matrixRow = matrix[sampleIndex];
        }
        if (headers[j] === "sample") {
          matrixRow[j] = result[i].sample;
        }
        if (headers[j] === "timestamp") {
          matrixRow[j] = result[i].timestamp;
        }
        if (headers[j] === result[i].metric) {
          matrixRow[j] = result[i].value;
        }
        matrix[sampleIndex] = matrixRow;
      }
    }

    cleanMatrix = matrix.filter(function (val) {
      return val !== undefined && val !== null;
    });

    return cleanMatrix;
  }

  private applyTrendlineFormat(matrix: any[]) {
    let trendlineMatrix = [];
    let row = [];
    let values = [];
    const headers = matrix[0];

    for (let i = 0; i < matrix.length; i++) {
      row = [];
      values = matrix[i];

      if (headers.length === values.length) {
        for (let j = 1; j < headers.length; j++) {
          if (values[j] !== undefined && values[j] !== null) {
            row.push(values[j]);
          }
        }
        if (row.length === headers.length - 1) {
          trendlineMatrix.push(row);
        }
      }
    }

    if (trendlineMatrix.length < 5) {
      trendlineMatrix = [];
    }

    return trendlineMatrix;
  }

  private normalizeData(matrix: any[]) {
    let metricValues = [];
    let minValues = 0;
    let maxValues = 0;

    for (let i = 1; i < matrix[0].length; i++) {
      metricValues = matrix.map(function (row) {
        return row[i];
      });
      metricValues = metricValues.filter(function (val) {
        return val !== undefined && val !== null;
      });
      metricValues.shift();
      minValues = Math.min(...metricValues);
      maxValues = Math.max(...metricValues);

      for (let j = 1; j < matrix.length; j++) {
        const array = matrix[j];
        if (array[i] !== undefined && array[i] !== null) {
          const metricValue = array[i];
          const result = (metricValue - minValues) / (maxValues - minValues);
          array[i] = result;
        } else {
          array[i] = null;
        }
      }
    }
    return matrix;
  }
}
