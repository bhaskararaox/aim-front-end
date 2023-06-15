import {TraceDataService} from "../../../services/app.tracedataservice";
import {MessageService} from "../../../services/app.messageservice";
import {TreeNode} from "primeng/primeng";
import {SearchData} from "../../../models/app.searchdata";
import {Summary} from "../models/dashboard.summary";
import {PieChartConfig} from "../models/PieChartConfig";

export class ByWorkloadController {
  private dataService: TraceDataService;
  public messageService: MessageService;
  private searchData: SearchData;
  public data: TreeNode [];
  public showByWorkload: boolean;
  public dataTableReady: boolean;
  // Chart variables:
  public summaryData: any[];
  public configSummary: PieChartConfig;
  public elementIdSummary: String;
  public summaryChartData: number[];
  public summaryChartLabels: string[];

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.data = [];
    this.showByWorkload = false;
    this.dataTableReady = false;
    this.summaryData = [];
    this.summaryChartData = [];
    this.summaryChartLabels = [];
  }

  public setSearchData(searchData: SearchData) {
    this.data = [];
    this.showByWorkload = false;
    this.dataTableReady = false;
    this.summaryData = [];
    this.summaryChartData = [];
    this.summaryChartLabels = [];
    this.searchData = searchData;
  }

  public load() {
    this.messageService.showSpinner();
    this.dataService.getSummaryByWorkload(this.searchData.input).subscribe(searchResult => {
      this.dataTableReady = true;
      this.data = this.loadTable(searchResult);
      this.loadChart(searchResult);
      this.showByWorkload = true;
      this.messageService.hideSpinner();
    });
  }

  private loadTable(searchResult: any) {
    let node;
    let treeNodes = [];

    for (let workload of searchResult.data) {
      let workloadName = workload.data.workload;
      let numberOfComponents = workload.data.numComponents;
      let numberOfTracesByWorkload = workload.data.numTraces;
      node = {
        data: {
          "Workload": workloadName,
          "NumComponents": numberOfComponents,
          "Component": '',
          "NumTraces": numberOfTracesByWorkload,
          "goldTraces":  workload.data.goldTraces,
          "silverTraces": workload.data.silverTraces,
          "bronzeTraces": workload.data.bronzeTraces,
          "segment": workload.data.segment
        },
        children: [],
      };

      for (let component of workload.children) {
        let componentName = component.data.component;
        let numberOfTracesByComponent = component.data.numTraces;
        node.children.push({
          data: {
            "Workload": '',
            "NumComponents": '',
            "Component": componentName,
            "NumTraces": numberOfTracesByComponent,
            "goldTraces":  component.data.goldTraces,
            "silverTraces": component.data.silverTraces,
            "bronzeTraces": component.data.bronzeTraces,
            "segment": component.data.segment
          }
        })
      }
      treeNodes.push(node);
    }

    treeNodes.sort(function (a, b) {
      if (parseInt(a.data.NumTraces) > parseInt(b.data.NumTraces))
        return -1;

      if (parseInt(a.data.NumTraces) < parseInt(b.data.NumTraces))
        return 1;

      return 0;
    });

    return treeNodes;
  }

  private loadChart(searchResult: any) {
    let array = [];
    let chartData: Summary[] = [];

    for (let workload of searchResult.data) {
      let numberOfTraces = +workload.data.numTraces; // Add a plus sign to cast a string to a number
      chartData.push(new Summary(workload.data.workload, numberOfTraces));
    }

    chartData.sort(function (a, b) {
      if (a.quantity > b.quantity)
        return -1;

      if (a.quantity < b.quantity)
        return 1;

      return 0;
    });

    this.summaryChartData = chartData.map(summary => summary.quantity);
    this.summaryChartLabels = chartData.map(summary => summary.summaryField);

    array.push(['Workload', 'Traces']);
    for (let i = 0; i < this.summaryChartData.length; i++) {
      array.push([this.summaryChartLabels[i], this.summaryChartData[i]]);
    }

    this.summaryData = array;
    this.configSummary = new PieChartConfig('Result Chart', 0);
    this.elementIdSummary = "workloadPieChart";
  }

  public downloadCSV() {
    let data, filename, link;

    let csv = this.convertArrayOfObjectsToCSV({
      data: this.data
    });

    if (csv == null) return;

    filename = "ComponentsSummary.csv" || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  }

  private convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;
    data = args.data || null;

    if (data == null || !data.length) {
      return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0].data); //Column headers
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {

      if (item.parent == undefined){
        // Start with the parent data
        ctr = 0;
        keys.forEach(function (key) {
          if (ctr > 0){
            result += columnDelimiter;
          }
          result += item.data[key];
          ctr++;
        });
        result += lineDelimiter;

        // Then go each children data
        item.children.forEach(function (children){
          ctr = 0;
          keys.forEach(function (key) {
            if (ctr > 0){
              result += columnDelimiter;
            }
            result += children.data[key];
            ctr++;
          });
          result += lineDelimiter;
        });
      }

    });

    return result;
  }

}
