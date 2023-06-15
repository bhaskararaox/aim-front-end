import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {SearchData} from "../../models/app.searchdata";
import {TraceDataService} from "../../services/app.tracedataservice";
import {MessageService} from "../../services/app.messageservice";
import {BySegmentController} from "./controllers/dashboard.bysegmentcontroller";
import {ByWorkloadController} from "./controllers/dashboard.byworkloadcontroller";
import {ByClassificationController} from "./controllers/dashboard.byclassificationcontroller";
import {ByIsaComponentController} from "./controllers/dashboard.byisacomponentcontroller";
import {ByIsaWorkloadController} from "./controllers/dashboard.byisaworkloadcontroller";
import {QueryResult} from "../../models/app.queryresult";

@Component({
  selector: "dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  providers: [],
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent implements OnInit {
  private readonly dataService: TraceDataService;
  private readonly messageService: MessageService;

  public bySegmentController: BySegmentController;
  public byWorkloadController: ByWorkloadController;
  public byClassificationController: ByClassificationController;
  public byIsaComponentController: ByIsaComponentController;
  public byIsaWorkloadController: ByIsaWorkloadController;

  public firstTimeBySegment: boolean;
  public firstTimeByWorkload: boolean;
  public firstTimeByClassification: boolean;
  public firstTimeByIsaComponent: boolean;
  public firstTimeByIsaWorkload: boolean;

  private details;
  public labelText: string;
  public nodeSelected: any;
  public row: any; // Not really used, just here to highlight the selected row in the HTML
  public graphAvailable: boolean;
  public summaryDetailsExists: boolean;

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;

    this.bySegmentController = new BySegmentController(dataService, messageService);
    this.byWorkloadController = new ByWorkloadController(dataService, messageService);
    this.byClassificationController = new ByClassificationController(dataService, messageService);
    this.byIsaComponentController = new ByIsaComponentController(dataService, messageService);
    this.byIsaWorkloadController = new ByIsaWorkloadController(dataService, messageService);

    this.firstTimeBySegment = true;
    this.firstTimeByWorkload = true;
    this.firstTimeByClassification = true;
    this.firstTimeByIsaComponent = true;
    this.firstTimeByIsaWorkload = true;
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.summaryDetailsExists = false;
   }

  public ngOnInit(): void {
    this.messageService.getQueryBroadcasted().subscribe(searchData => this.onQueryBroadcasted(searchData));
    this.messageService.getSearchCompleted().subscribe(queryResult => this.onSearchCompleted(queryResult));
  }

  public getWorkloadFromClickEvent(event) {
    this.graphAvailable = true;
    if (event.node.parent === undefined) { // If it is a parent node
      this.nodeSelected = event.node;
    } else { // If it is a children node
      this.nodeSelected = event.node.parent;
    }
  }

  public getComponentFromClickEvent(event) {
    this.graphAvailable = true;
    if (event.node.parent === undefined) { // If it is a parent node
    //this.nodeSelected = event.node.children[0];
      this.graphAvailable = false;
    } else { // If it is a children node
      if (event.node.parent !== undefined && event.node.children !== undefined) { // If has parent and has children
        this.nodeSelected = event.node;
      } else if (event.node.children === undefined) {
        this.nodeSelected = event.node.parent;
      }
    }
  }

  public graphComponents() {
    if (this.nodeSelected == null) {
      // Alert the user to select any row in the table to graph (done elsewhere)
    } else {
      this.messageService.showComponentDetails(this.nodeSelected);
    }
  }

  public graphIsa(weighted: boolean) {
    if (this.nodeSelected != null) {
      this.messageService.showIsaExtensionDetails(this.nodeSelected, weighted);
    }
  }

  public showDashboard() {
    this.details = document.getElementById("summaryDetails");
      if (this.details.open) {
      this.labelText = "Show summary";
      this.summaryDetailsExists = true;
      this.details.open = false;
    } else {
      this.labelText = "Hide summary";
      this.details.open = true;
    }
    this.showWorkloadSummary();
  }

  public showWorkloadSummary() {
    if (this.firstTimeByWorkload) {
      this.byWorkloadController.load();
      this.firstTimeByWorkload = false;
    }
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.bySegmentController.showBySegment = false;
    this.byWorkloadController.showByWorkload = true;
    this.byClassificationController.showByClassification = false;
    this.byIsaComponentController.showByIsaComponent = false;
    this.byIsaWorkloadController.showByIsaWorkload = false;
  }

  public showClassificationSummary() {
    if (this.firstTimeByClassification) {
      this.byClassificationController.load();
      this.firstTimeByClassification = false;
    }
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.bySegmentController.showBySegment = false;
    this.byWorkloadController.showByWorkload = false;
    this.byClassificationController.showByClassification = true;
    this.byIsaComponentController.showByIsaComponent = false;
    this.byIsaWorkloadController.showByIsaWorkload = false;
  }

  public showSegmentSummary() {
    if (this.firstTimeBySegment) {
      this.bySegmentController.load();
      this.firstTimeBySegment = false;
    }
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.bySegmentController.showBySegment = true;
    this.byWorkloadController.showByWorkload = false;
    this.byClassificationController.showByClassification = false;
    this.byIsaComponentController.showByIsaComponent = false;
    this.byIsaWorkloadController.showByIsaWorkload = false;
  }

  public showIsaByComponentSummary() {
    if (this.firstTimeByIsaComponent) {
      this.byIsaComponentController.load();
      this.firstTimeByIsaComponent = false;
    }
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.bySegmentController.showBySegment = false;
    this.byWorkloadController.showByWorkload = false;
    this.byClassificationController.showByClassification = false;
    this.byIsaComponentController.showByIsaComponent = true;
    this.byIsaWorkloadController.showByIsaWorkload = false;
  }

  public showIsaByWorkloadSummary() {
    if (this.firstTimeByIsaWorkload) {
      this.byIsaWorkloadController.load();
      this.firstTimeByIsaWorkload = false;
    }
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    this.bySegmentController.showBySegment = false;
    this.byWorkloadController.showByWorkload = false;
    this.byClassificationController.showByClassification = false;
    this.byIsaComponentController.showByIsaComponent = false;
    this.byIsaWorkloadController.showByIsaWorkload = true;
  }


  private onQueryBroadcasted(searchData: SearchData) {
    this.bySegmentController.setSearchData(searchData);
    this.byClassificationController.setSearchData(searchData);
    this.byWorkloadController.setSearchData(searchData);
    this.byIsaComponentController.setSearchData(searchData);
    this.byIsaWorkloadController.setSearchData(searchData);

    this.firstTimeBySegment = true;
    this.firstTimeByWorkload = true;
    this.firstTimeByClassification = true;
    this.firstTimeByIsaComponent = true;
    this.firstTimeByIsaWorkload = true;
    this.row = null;
    this.nodeSelected = null;
    this.graphAvailable = false;
    if (this.summaryDetailsExists === true) {
      this.details = document.getElementById("summaryDetails");
      this.labelText = "Show summary";
      this.details.open = false;
    }
  }

  private onSearchCompleted(queryResult: QueryResult) {
    if (queryResult.totalElements === 0) {
      this.summaryDetailsExists = false;
    }else{
      this.summaryDetailsExists = true;
      this.labelText = "Show summary";
      this.details = document.getElementById("summaryDetails");
      if (this.details != null) {
        this.details.open = false;
      }
    }
  }

}
