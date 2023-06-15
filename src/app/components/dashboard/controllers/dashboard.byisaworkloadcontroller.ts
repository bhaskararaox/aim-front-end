import {TraceDataService} from "../../../services/app.tracedataservice";
import {MessageService} from "../../../services/app.messageservice";
import {TreeNode} from "primeng/primeng";
import {SearchData} from "../../../models/app.searchdata";

export class ByIsaWorkloadController {
  private dataService: TraceDataService;
  public messageService: MessageService;
  private searchData: SearchData;
  public data: TreeNode [];
  public showByIsaWorkload: boolean;
  public dataTableReady: boolean;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.data = [];
    this.showByIsaWorkload = false;
    this.dataTableReady = false;
  }

  public setSearchData(searchData: SearchData) {
    this.data = [];
    this.showByIsaWorkload = false;
    this.dataTableReady = false;
    this.searchData = searchData;
  }

  public load() {
    this.messageService.showSpinner();
    this.dataService.getSummaryByIsaWorkload(this.searchData.input).subscribe(searchResult => {
      this.dataTableReady = true;
      this.data = this.loadTable(searchResult);
      this.showByIsaWorkload = true;
      this.messageService.hideSpinner();
    });
  }

  private loadTable(searchResult: any) {
    let treeNodes = [];
    let dataMap = searchResult.data;

    for (let key in dataMap) {
      let workload = key;
      let isaMap = dataMap[key];

      let workloadNode = {
        data: {
          "Workload": workload,
          "IsaExtension": '',
          "WeightedPercentage": '',
          "UnweightedPercentage": ''
        },
        children: []
      };

      for (const isaName in isaMap) {
        workloadNode.children.push({
          data: {
            "Workload": '',
            "IsaExtension": isaName,
            "WeightedPercentage": isaMap[isaName][0],
            "UnweightedPercentage": isaMap[isaName][1]
          }
        })
      }
      treeNodes.push(workloadNode);
    }
    return treeNodes;
  }

  public downloadCSV() {
    let data, filename, link;

    let csv = this.convertArrayOfObjectsToCSV({
      data: this.data
    });

    if (csv == null) return;

    filename = "IsaByWorkloadSummary.csv" || 'export.csv';

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
