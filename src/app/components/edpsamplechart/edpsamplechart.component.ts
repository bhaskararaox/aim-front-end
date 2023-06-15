import {Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {ChartConfig} from './model/chartConfig';
import {EDPSampleModel} from './model/EDPSampleModel';
import {Message} from 'primeng/primeng'
import {MessageService} from "../../services/app.messageservice";
import {AppEmonEdpData} from "../../models/app.emonedpdata";
import {TraceDataService} from "../../services/app.tracedataservice";

@Component({
  selector: 'app-edpsamplechart',
  templateUrl: './edpsamplechart.component.html',
  styleUrls: ['./edpsamplechart.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})
export class EdpsamplechartComponent implements OnInit {
  @Input() sampleTimeStamp: any[];
  @Input() metrics: any[];
  @Input() sockets: any[];
  @Input() cores: any[];
  @Input() package: any[];
  public chartType = 'chart';
  public messages: Message[] = [];
  public selectedSampleTimeStamp: any;
  public selectedMetrics: any;
  public selectedMetricsTrendLine: any;
  public selectedSockets: any;
  public selectedCores: any;
  public selectedPackage: any;
  public hideEmonEdpWindow: boolean = false;
  public chartData: any[] = [];
  public metricResult: any;
  public metricsArray: any;
  public plotDataArry = [];
  public messageService: MessageService;
  public appEmonEdpData: AppEmonEdpData;
  public appEmonEdpMetricData: AppEmonEdpData;
  public traceName: any;
  public configurationName: any;
  public dataService: TraceDataService;
  public trendLine: boolean = false;
  public metricValues = [];
  public metricValuesTrendLine = [];
  public metricTrendLine = [];
  public CPINames = [];
  public collectionDate;

  constructor(messageService: MessageService, dataService: TraceDataService) {
    this.messageService = messageService;
    this.dataService = dataService;
    this.messageService.getHideEmonEdpWindow().subscribe(data => this.hideEmonEdpWindow = data);

    this.messageService.getShowEmonEdpWindow().subscribe(emonEdpData => {
      this.setAppEmonEdpData(emonEdpData);
    });
  }

  public sendMessageToParent() {
    this.messageService.hideEmonEdpWindow(true);
  }

  ngOnInit(): void {
  }

  private setAppEmonEdpData(appEmonEdpData: AppEmonEdpData) {
    this.selectedMetricsTrendLine = [];
    this.selectedSampleTimeStamp = [];
    this.selectedCores = [];
    this.selectedPackage = [];
    this.selectedSockets = [];
    this.selectedMetrics = [];
    this.trendLine = false;
    this.chartData = [];
    this.metrics = [];
    this.cores = [];
    this.sockets = [];
    this.package = [];
    this.appEmonEdpData = appEmonEdpData;
    this.configurationName = appEmonEdpData.configuration;
    this.traceName = appEmonEdpData.traceName
    this.messageService.showSpinner();
    this.dataService.getEDPSampleChartComboboxData(this.appEmonEdpData).subscribe(result => {
      this.metricsArray = result;
      if (result != null) {
        this.loadAllComboBoxData(this.metricsArray);
      }
      this.messageService.hideSpinner();
    });
  }

  public getErrorMessage(msg: string) {
    this.messages = [{
      severity: 'error',
      summary: 'Dropdown Error',
      detail: 'Please, select ' + msg
    }];
    return true;
  }

  public getGraphPlotError() {
    this.messages = [{
      severity: 'error',
      summary: 'Graph Plot Error',
      detail: 'Insufficient data, graph cannot be plotted'
    }];
    return true;
  }

  public onSampleTimeStampChange(event) {
    let selectedValue = event.value;
    for (let i = 0; i < this.CPINames.length; i++) {
      if (selectedValue == this.CPINames[i]) {
        selectedValue = "trendLine";
      }
    }
    if (selectedValue == "trendLine") {
      this.metrics = this.metricValues;
      this.trendLine = true;
    } else {
      this.metricTrendLine = this.metricValuesTrendLine;
      this.trendLine = false;
    }
  }

  public addCharts() {
    let metricsArray = [];
    if (!this.isDropDownEmpty(this.trendLine)) {
      let selectedSocketsArray = [];
      selectedSocketsArray.push(parseInt(this.selectedSockets));
      let selectedCoresArray = [];
      selectedCoresArray.push(parseInt(this.selectedCores));
      let selectedPackageArray = [];
      selectedPackageArray.push(parseInt(this.selectedPackage));

      let selectedMetricArray;
      let title = "";
      let trendLineChart;
      let trendLineIndex = 0;
      let currentDropDownValue;

      for (let i = 0; i < this.CPINames.length; i++) {
        if (this.selectedSampleTimeStamp == this.CPINames[i]) {
          trendLineChart = "trendLine";
          currentDropDownValue = this.selectedSampleTimeStamp;
          this.selectedSampleTimeStamp = "trendLine";
          trendLineIndex = i;
        }
      }

      if (this.selectedSampleTimeStamp == "trendLine") {
        if (typeof this.selectedMetricsTrendLine == "string") {
          metricsArray.push(this.selectedMetricsTrendLine);
          metricsArray.push(this.CPINames[trendLineIndex]);
          selectedMetricArray = metricsArray;
          this.chartType = "trendLine";
          title = 'Metric ';
        }
      } else {
        currentDropDownValue = this.selectedSampleTimeStamp;

        selectedMetricArray = this.selectedMetrics;
        const metricLengthArray = selectedMetricArray.length;
        if (metricLengthArray == 1) {
          this.chartType = "single";
          title = 'Metric ';
        } else {
          if (this.selectedSampleTimeStamp != "trendLine") {
            this.chartType = "multiple";
            title = 'Metrics';
          }
        }
      }
      this.messageService.showSpinner();
      this.appEmonEdpMetricData = new AppEmonEdpData(this.traceName, this.configurationName,
        selectedMetricArray, selectedSocketsArray, selectedCoresArray, selectedPackageArray);
      this.dataService.getEDPSampleChartMetricData(this.appEmonEdpMetricData).subscribe(result => {
        if (result != null) {
          this.collectionDate = this.getEDPSampleCollectionDate(result);
          this.metricResult = result;
          this.plotDataArry = this.loadChartData(this.metricResult, this.selectedSampleTimeStamp, this.chartType, selectedMetricArray);

          if (this.plotDataArry.length === 0) {
            this.getGraphPlotError();
          }
          else {
            if (this.selectedSampleTimeStamp == "samples") {
              this.chartData.push(
                new EDPSampleModel(this.plotDataArry,
                  new ChartConfig(this.chartType, this.chartType != "single", title + ' in Y Axis VS Samples in X Axis, EDP Published Date: ' + this.collectionDate,
                    this.selectedSampleTimeStamp, this.selectedMetrics[0], 'none', true, 90),
                  this.chartData.length.toString()));
            }
            if (this.selectedSampleTimeStamp == "Timestamp(s)") {
              this.chartData.push(
                new EDPSampleModel(this.plotDataArry,
                  new ChartConfig(this.chartType, this.chartType != "single", title + ' in Y Axis VS Timestamp(s) in X Axis, EDP Published Date: ' + this.collectionDate,
                    this.selectedSampleTimeStamp, this.selectedMetrics[0], 'none', true, 90),
                  this.chartData.length.toString()));
            }
            if (this.selectedSampleTimeStamp == "trendLine") {
              this.chartData.push(
                new EDPSampleModel(this.plotDataArry,
                  new ChartConfig(this.chartType, this.chartType != "single", title + ' CPI in Y Axis VS ' + this.selectedMetricsTrendLine + ' in X Axis, EDP Published Date: ' + this.collectionDate,
                    this.selectedMetricsTrendLine, currentDropDownValue, 'none', true, 90),
                  this.chartData.length.toString()));
            }
            this.chartData.sort((a, b) => parseFloat(b.elementId) - parseFloat(a.elementId));
          }
          this.selectedSampleTimeStamp = currentDropDownValue;
        }
        this.messageService.hideSpinner();
      });
    }
  }

  public isDropDownEmpty(trendLine) {
    let fields: string[] = [];
    if (this.selectedSampleTimeStamp == null || this.selectedSampleTimeStamp == '')
      fields.push("Sample/TimeStamp");
    if (trendLine == false) {
      if (this.selectedMetrics == null || this.selectedMetrics == '') {
        fields.push("Metrics");
      }
    } else {
      if (this.selectedMetricsTrendLine == null || this.selectedMetricsTrendLine == '') {
        fields.push("Metrics");
      }
    }
    if (this.selectedSockets == null || this.selectedSockets == '')
      fields.push("Sockets");
    if (this.selectedCores == null || this.selectedCores == '')
      fields.push("Cores");
    if (this.selectedPackage == null || this.selectedPackage == '')
      fields.push("Package");
    switch (fields.length) {
      case 0:
        return false;
      case 1:
        return this.getErrorMessage("a value for " + fields.join() + " Dropdown List!");
      case 5:
        return this.getErrorMessage("one value for each of the Dropdown Lists options available!");
      default:
        return this.getErrorMessage("a value for " + fields.join(', ').replace(/,(?=[^,]*$)/, ' and') + " Dropdown Lists!");
    }
  }

  public deleteAllCharts() {
    this.chartData = [];
  }

  public getRemove(index: any) {
    let newArray = [];
    for (var i = 0; i < this.chartData.length; i++) {
      if (this.chartData[i].elementId != index) {
        newArray.push(this.chartData[i]);
      }
    }
    newArray.sort((a, b) => parseFloat(b.elementId) - parseFloat(a.elementId));
    this.chartData = newArray;
    return this.chartData;
  }

  public loadSingleMetricData(selectedMetricArray, plotDataArry, type, chartType) {
    let chartValues;
    let resultChartTable = this.createChartDataTableFormat(selectedMetricArray, plotDataArry, type, chartType);
    chartValues = this.scatterPlotArray(resultChartTable);
    return chartValues;
  }

  public scatterPlotArray(data) {
    let array = [];
    let totalArrayNonEmptyCount = 0;
    for (let y = 0; y < data.length; y++) {
      let y = [];
      array.push(y);
    }
    for (let n = 0; n < data.length; n++) {
      let values = data[n];
      for (let x = 1; x < values.length; x++) {
        let metricValues = array[n];
        metricValues.push(values[x]);
      }
    }
    if (array.length > 0) {
      for (let i = 1; i < array.length; i++) {
        let nonEmptyValueCount = 0;
        let values = array[i];
        if (values.length > 1) {
          for (let j = 1; j < values.length; j++) {
            if (values[0] != null && values[j] != null) {
              ++nonEmptyValueCount;
            }
          }
        }
        if (nonEmptyValueCount > 0) {
          ++totalArrayNonEmptyCount;
        }
      }
    }
    if (totalArrayNonEmptyCount < 5) {
      array = [];
    }
    return array;
  }

  public convertMultipleMetricDataFromJsonToArray(selectedMetricArray, plotDataArry) {
    let mapMetrics = new Map();
    let metricsValueArraySamples = [];
    let metricsValueArrayTimes = [];
    let metricLengthArray = selectedMetricArray;
    for (let i = 0; i < metricLengthArray.length; i++) {
      let metric = metricLengthArray[i];
      let metricArray = metric;
      metricArray = [];
      mapMetrics.set(metric, metricArray);
    }
    mapMetrics.set("samples", metricsValueArraySamples);
    mapMetrics.set("Timestamp(s)", metricsValueArrayTimes);
    let endPointData = plotDataArry.data;
    for (let i = 0; i < endPointData.length; i++) {
      if (mapMetrics.has("samples") == true) {
        let array = mapMetrics.get("samples");
        array.push(endPointData[i].sample);
      }
      if (mapMetrics.has("Timestamp(s)") == true) {
        let array = mapMetrics.get("Timestamp(s)");
        array.push(endPointData[i].timestamp);
      }
    }
    for (let i = 0; i < endPointData.length; i++) {
      if (mapMetrics.has(endPointData[i].metric) == true) {
        let array = mapMetrics.get(endPointData[i].metric);
        array.push(endPointData[i].value);
      }
    }
    return mapMetrics;
  }

  public plotsDataNormalization(mapMetrics, chartType, resultChartTable) {
    let tempIndex = 0;
    for (let entry of Array.from(mapMetrics.entries())) {
      let key = entry[0].toString();
      if (key !== "samples") {
        if (key !== "Timestamp(s)") {
          let metricValuesArray = entry[1];
          let minValues = Math.min(...metricValuesArray);
          let maxValues = Math.max(...metricValuesArray);
          tempIndex = tempIndex + 1;
          for (let n = 1; n < resultChartTable.length; n++) {
            let array = resultChartTable[n];
            if (array[tempIndex] != null) {
              let arrayValue = array[tempIndex];
              let result = (arrayValue - minValues) / (maxValues - minValues);
              array[tempIndex] = result;
            }
          }
        }
      }

    }
    return resultChartTable;
  }

  public loadMultipleMetricData(selectedMetricArray, plotDataArry, type, chartType) {
    let mapMetrics;
    let chartValues;
    let resultChartTable;
    if (chartType === "multiple") {
      mapMetrics = this.convertMultipleMetricDataFromJsonToArray(selectedMetricArray, plotDataArry);
      resultChartTable = this.createChartDataTableFormat(selectedMetricArray, plotDataArry, type, chartType);
      chartValues = this.plotsDataNormalization(mapMetrics, chartType, resultChartTable);
    } else {
      chartValues = this.createChartDataTableFormat(selectedMetricArray, plotDataArry, type, chartType);
    }
    return chartValues;
  }

  public getMaxSampleMetricsResults(plotDataArry) {
    let maxValue = 0;
    let metricsResult = plotDataArry.data;
    for (let i = 0; i < metricsResult.length; i++) {
      let sampleValue = metricsResult[i].sample;
      if (sampleValue > maxValue) {
        maxValue = sampleValue;
      }
    }
    return maxValue;
  }

  public createMatrixNullPlotTable(maxSampleValue, selectedMetricArray, type, plotDataArry) {
    let matrix = [];
    for (let i = 0; i < maxSampleValue + 1; i++) {
      let i = [];
      matrix.push(i);
    }
    let selectedMetrics = selectedMetricArray;
    matrix[0].push(type);
    for (let x = 0; x < selectedMetrics.length; x++) {
      matrix[0].push(selectedMetrics[x]);
    }
    let headerLength = matrix[0];
    for (let j = 1; j < matrix.length; j++) {
      for (let n = 0; n < headerLength.length; n++) {
        matrix[j].push(null);
      }
    }
    return this.loopNullDataTableFillWithMetricsResult(matrix, plotDataArry, headerLength);
  }

  public samplesLineChartDataMatrix(matrix, plotDataArry, headerLength) {
    let metricsResult = plotDataArry.data;
    for (let n = 0; n < headerLength.length; n++) {
      for (let x = 0; x < metricsResult.length; x++) {
        if (headerLength[n] == "samples") {
          let sampleIndex = metricsResult[x].sample;
          let array = matrix[sampleIndex];
          array[n] = sampleIndex;
        } else {
          if (metricsResult[x].metric == headerLength[n]) {
            let sampleIndex = metricsResult[x].sample;
            let array = matrix[sampleIndex];
            array[n] = metricsResult[x].value;
          }
        }
      }
    }
    return this.removeNullFromMatrix(matrix);
  }

  public removeNullFromMatrix(matrix) {
    let cleanArray = [];
    let status = false;
    for (let n = 0; n < matrix.length; n++) {
      let values = matrix[n];
      for (let x = 1; x < values.length; x++) {
        for (let x = 1; x < values.length; x++) {
          if (values[x] === null) {
            status = true;
          } else {
            status = false;
            break;
          }
        }
      }
      if (status === false) {
        cleanArray.push(values);
      }
    }
    return cleanArray;
  }

  public timeStampLineChartDataMatrix(matrix, plotDataArry, headerLength) {
    let metricsResult = plotDataArry.data;
    for (let n = 0; n < headerLength.length; n++) {
      for (let x = 0; x < metricsResult.length; x++) {
        if (headerLength[n] == "Timestamp(s)") {
          let sampleIndex = metricsResult[x].sample;
          let timeStamp = metricsResult[x].timestamp;
          let array = matrix[sampleIndex];
          let date = new Date(timeStamp);
          let hour = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
          array[n] = hour;
        } else {
          if (metricsResult[x].metric == headerLength[n]) {
            let sampleIndex = metricsResult[x].sample;
            let array = matrix[sampleIndex];
            array[n] = metricsResult[x].value;
          }
        }
      }
    }
    return this.removeNullFromMatrix(matrix);
  }

  public trendLineChartDataMatrix(matrix, plotDataArry, headerLength) {
    let metricsResult = plotDataArry.data;
    for (let n = 0; n < headerLength.length; n++) {
      for (let x = 0; x < metricsResult.length; x++) {
        if (headerLength[n] == "trendLine") {
          let sampleIndex = metricsResult[x].sample;
          let timeStamp = metricsResult[x].timestamp;
          let array = matrix[sampleIndex];
          let date = new Date(timeStamp);
          let hour = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
          array[n] = hour;
        } else {
          if (metricsResult[x].metric == headerLength[n]) {
            let sampleIndex = metricsResult[x].sample;
            let array = matrix[sampleIndex];
            array[n] = metricsResult[x].value;
          }
        }
      }
    }
    return this.removeNullFromMatrix(matrix);
  }

  public getEDPSampleCollectionDate(result) {
    return result.dataPublishedDate;
  }

  public loopNullDataTableFillWithMetricsResult(matrix, plotDataArry, headerLength) {
    let chartType = headerLength[0];
    let result;
    if (chartType == "samples") {
      result = this.samplesLineChartDataMatrix(matrix, plotDataArry, headerLength);
    }
    if (chartType == "Timestamp(s)") {
      result = this.timeStampLineChartDataMatrix(matrix, plotDataArry, headerLength);
    }
    if (chartType == "trendLine") {
      result = this.trendLineChartDataMatrix(matrix, plotDataArry, headerLength);
    }
    return result;
  }

  public createChartDataTableFormat(selectedMetricArray, plotDataArry, type, chartType) {
    let maxSampleValue = this.getMaxSampleMetricsResults(plotDataArry);
    return this.createMatrixNullPlotTable(maxSampleValue, selectedMetricArray, type, plotDataArry);
  }

  public loadChartData(plotDataArry: any, type: any, chartType: string, selectedMetricArray) {
    let chartValues = [];
    if (chartType == "trendLine") {
      chartValues = this.loadSingleMetricData(selectedMetricArray, plotDataArry, type, chartType);
    } else {
      chartValues = this.loadMultipleMetricData(selectedMetricArray, plotDataArry, type, chartType);
    }
    return chartValues;
  }

  public getScatterPlotCPINames(metricsArray) {
    let CPI = [];
    let metricsName = metricsArray.data.metrics;
    for (let x = 0; x < metricsName.length; x++) {
      let metricNameSubString = metricsName[x].substring(0, 3);
      if (metricNameSubString == "CPI") {
        CPI.push(metricsName[x]);
      }
    }
    return CPI;
  }

  public loadAllComboBoxData(metricsArray: any) {

    this.metricValues = [];
    this.metricValuesTrendLine = [];
    let coreValues = [];
    let socketValues = [];
    let packageValues = [];
    coreValues.push({label: "", value: ""});
    socketValues.push({label: "", value: ""});
    packageValues.push({label: "", value: ""});
    let metric = metricsArray.data.metrics;
    let core = metricsArray.data.cores;
    let socket = metricsArray.data.sockets;
    let packages = metricsArray.data.packages;
    this.metricValuesTrendLine.push({label: "", value: ""});
    this.CPINames = this.getScatterPlotCPINames(this.metricsArray);
    for (let x = 0; x < metric.length; x++) {
      this.metricValues.push({label: metric[x].toString(), value: metric[x].toString()});
      for (let j = 0; j < this.CPINames.length; j++) {
        if (metric[x].toString() != this.CPINames[j]) {
          this.metricValuesTrendLine.push({label: metric[x].toString(), value: metric[x].toString()});
        }
      }
    }
    for (let x = 0; x < core.length; x++) {
      coreValues.push({label: core[x].toString(), value: core[x].toString()});
    }
    for (let x = 0; x < socket.length; x++) {
      socketValues.push({label: socket[x].toString(), value: socket[x].toString()});
    }
    for (let x = 0; x < packages.length; x++) {
      packageValues.push({label: packages[x].toString(), value: packages[x].toString()});
    }
    this.sampleTimeStamp = [{label: '', value: ''}, {label: 'Samples', value: 'samples'}, {
      label: 'Timestamp(s)',
      value: 'Timestamp(s)'
    }];
    for (let x = 0; x < this.CPINames.length; x++) {
      this.sampleTimeStamp.push({label: this.CPINames[x] + " TrendLine", value: this.CPINames[x]});
    }
    this.metrics = this.metricValues;
    this.metricTrendLine = this.metricValuesTrendLine;
    this.cores = coreValues;
    this.sockets = socketValues;
    this.package = packageValues;
  }
}
