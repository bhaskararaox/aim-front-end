import {TraceDataService} from "../../../services/app.tracedataservice";
import {MessageService} from "../../../services/app.messageservice";
import {TreeNode} from "primeng/primeng";
import {SearchData} from "../../../models/app.searchdata";

export class ByIsaComponentController {
  private dataService: TraceDataService;
  public messageService: MessageService;
  private searchData: SearchData;
  public data: TreeNode [];
  public showByIsaComponent: boolean;
  public dataTableReady: boolean;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.data = [];
    this.showByIsaComponent = false;
    this.dataTableReady = false;
  }

  public setSearchData(searchData: SearchData) {
    this.data = [];
    this.showByIsaComponent = false;
    this.dataTableReady = false;
    this.searchData = searchData;
  }

  public load() {
    this.messageService.showSpinner();
    this.dataService.getSummaryByIsaComponent(this.searchData.input).subscribe(searchResult => {
      this.dataTableReady = true;
      this.data = this.loadTable(searchResult);
      this.showByIsaComponent = true;
      this.messageService.hideSpinner();
    });
  }

  private loadTable(searchResult: any) {
    let treeNodes = [];
    let dataMap = searchResult.data;
    let workloadNode = {data: { "Workload": '' }, children: []};

    for (let key in dataMap) {
      let row = key.split("#");
      let workload = row[0];
      let component = row[1];
      let isaMap = dataMap[key];

      if (workloadNode.data["Workload"] !== workload) {
        workloadNode = {
          data: {
            "Workload": workload
          },
          children: []
        };
        treeNodes.push(workloadNode);
      }

      let componentNode = {
        data: {
          "Component": component
        },
        children: []
      };

      for (const isaName in isaMap) {
        componentNode.children.push({
          data: {
            "IsaExtension": isaName,
            "WeightedPercentage": isaMap[isaName][0],
            "UnweightedPercentage": isaMap[isaName][1]
          }
        })
      }
      workloadNode.children.push(componentNode);
    }
    return treeNodes;
  }

}
