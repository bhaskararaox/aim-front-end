import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {MessageService} from "../../services/app.messageservice";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: "edp-dashboard",
  templateUrl: "./edp-dashboard.component.html",
  styleUrls: ["./edp-dashboard.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class EdpDashboardComponent implements OnInit {

  public selectedTrace: string;
  public selectedWorkload: string;

  private router: Router;
  private route: ActivatedRoute;
  private messageService: MessageService;

  constructor(router: Router, route: ActivatedRoute, messageService: MessageService) {
    this.route = route;
    this.router = router;
    this.messageService = messageService;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedWorkload = params["config"];
      this.selectedTrace = params["trace"];
    });

    this.messageService.getShowEmonEdpWindow().subscribe(emonEdpData => {
      this.selectedWorkload = emonEdpData.configuration;
      this.selectedTrace = emonEdpData.traceName;
    });
  }

  /*public showSearchResults() {
    //this.messageService.hideEmonEdpWindow(true);
    this.router.navigate(["/home"])
  }*/

  public showNestedComponents() {
    const display = this.selectedTrace !== undefined && this.selectedWorkload !== undefined;
    return display;
  }

}
