import * as $ from "jquery";
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MessageService} from "./services/app.messageservice";
import {Subscription} from "rxjs/Subscription";
import {Message} from "../../node_modules/primeng/primeng";
import {TraceDataService} from "./services/app.tracedataservice";
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

  public pageLoaded = false;
  public isProduction = true;
  public showLoading = false;
  public showPoohLoading = false;
  public displayPoohLoading = false;
  public useridsid = "";
  private dataService: TraceDataService;
  private messageService: MessageService;
  private showSpinnerSubscription: Subscription;
  private hideSpinnerSubscription: Subscription;
  private removeSpinnerSubscription: Subscription;
  private showErrorMessageSubscription: Subscription;
  private showSuccessMessageSubscription: Subscription;
  private showInfoMessageSubscription: Subscription;
  private showSpinnerRequests = 0;
  public messages: Message[] = [];

  constructor(dataService: TraceDataService, messageService: MessageService) {
    this.dataService = dataService;
    this.messageService = messageService;
  }

  ngOnInit(): void {
    this.getLoggedUser();
    this.showSpinnerSubscription = this.messageService.getShowSpinner().subscribe(() => this.showSpinner());
    this.hideSpinnerSubscription = this.messageService.getHideSpinner().subscribe(() => this.hideSpinner());
    this.removeSpinnerSubscription = this.messageService.getRemoveSpinner().subscribe(() => this.removeSpinner());
    this.showErrorMessageSubscription = this.messageService.getShowErrorMessage().subscribe( data =>
      this.showErrorMessage(data.errorSummary, data.errorDetail));
    this.showSuccessMessageSubscription = this.messageService.getShowSuccessMessage().subscribe( data =>
      this.showSuccessMessage(data.successSummary, data.successDetail));
    this.showInfoMessageSubscription = this.messageService.getShowInfoMessage().subscribe( data =>
      this.showInfoMessage(data.infoSummary, data.infoDetail));
  }

  public showErrorMessage(errorSummary: string, errorDetail: string) {
    this.messages = [{
      severity: "error",
      summary: errorSummary,
      detail: errorDetail
    }];
  }

  public showSuccessMessage(successSummary: string, successDetail: string) {
    this.messages = [{
      severity: "success",
      summary: successSummary,
      detail: successDetail
    }];
  }

  public showInfoMessage(infoSummary: string, infoDetail: string) {
    this.messages.push({
      severity: "info",
      summary: infoSummary,
      detail: infoDetail
    });
  }

  public clearMessages() {
    this.messages = [];
  }

  private showSpinner() {
    this.showSpinnerRequests++;
    this.showLoading = true;
    $("#page").css({"opacity": "0.4"});
  }

  private hideSpinner() {
    this.showSpinnerRequests--;
    if (this.showSpinnerRequests < 0) {
      this.showSpinnerRequests = 0;
    }
    if (this.showSpinnerRequests === 0) {
      this.showLoading = false;
      $("#page").css({"opacity": "1"});
    }
  }

  private removeSpinner() {
    this.showSpinnerRequests = 0;
    this.showLoading = false;
    $("#page").css({"opacity": "1"});
  }

  private getLoggedUser() {
    this.dataService.isUserAuthorized().subscribe(data => {
      this.useridsid = data.user.name;
    });
  }

  public checkPoohLoading(): boolean {
    this.isProduction = environment.production;
    this.displayPoohLoading = false;
    this.displayPoohLoading = this.useridsid.includes("smongees") && !this.isProduction;
    return this.displayPoohLoading;
  }

}
