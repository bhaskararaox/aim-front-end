import {TraceDataService} from "../../../services/app.tracedataservice";
import {PieChartConfig} from "../models/PieChartConfig";
import {SearchData} from "../../../models/app.searchdata";
import {Summary} from "../models/dashboard.summary";
import {MessageService} from "../../../services/app.messageservice";

export class ByClassificationController {
  private dataService: TraceDataService;
  public messageService: MessageService;
  private searchData: SearchData;
  public data: Summary[];
  public showByClassification: boolean;
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
    this.showByClassification = false;
    this.dataTableReady = false;
    this.summaryData = [];
    this.summaryChartData = [];
    this.summaryChartLabels = [];
  }

  public setSearchData(searchData: SearchData) {
    this.data = [];
    this.showByClassification = false;
    this.dataTableReady = false;
    this.summaryData = [];
    this.summaryChartData = [];
    this.summaryChartLabels = [];
    this.searchData = searchData;
  }

  public load() {
    this.messageService.showSpinner();
    this.dataService.getSummaryByClassification(this.searchData.input).subscribe(searchResult => {
      this.dataTableReady = true;
      this.loadTable(searchResult);
      this.loadChart(searchResult);
      this.showByClassification = true;
      this.messageService.hideSpinner();
    });

  }

  private loadTable(searchResult: any) {
    for (let row of searchResult.data) {
      this.data.push(new Summary(row.classificationName, row.numberOfTraces));

      this.data.sort(function (a, b) {
        if (a.quantity > b.quantity)
          return -1;

        if (a.quantity < b.quantity)
          return 1;

        return 0;
      });
    }
  }

  private loadChart(searchResult: any) {
    let array = [];
    let chartData: Summary[] = [];

    for (let row of searchResult.data) {
      chartData.push(new Summary(row.classificationName, row.numberOfTraces));
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

    array.push(['Classification', 'Traces']);
    for (let i = 0; i < this.summaryChartData.length; i++) {
      array.push([this.summaryChartLabels[i], this.summaryChartData[i]]);
    }

    this.summaryData = array;
    this.configSummary = new PieChartConfig('Result Chart', 0);
    this.elementIdSummary = "classificationPieChart";
  }

}
