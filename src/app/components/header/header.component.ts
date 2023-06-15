import {Component, ViewEncapsulation} from "@angular/core";
import {TraceDataService} from "../../services/app.tracedataservice";
import {environment} from "../../../environments/environment";
import {User} from "../../models/app.user";
import {SelectItem} from "primeng/primeng";
import {MessageService} from "../../services/app.messageservice";
import {overlayConfigFactory} from "angular2-modal";
import {BSModalContext, Modal} from "angular2-modal/plugins/bootstrap";
import {FeedbackFormComponent} from "../feedback-form/feedback-form.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  providers: [],
  encapsulation : ViewEncapsulation.None
})

export class HeaderComponent {
  public friendlyVersion: string = environment.FRIENDLY_VERSION;
  private dataService: TraceDataService;
  public showSwitchUser = false;
  private messageService: MessageService;
  public userTypes: SelectItem[] = [{label: "Admin", value: true}, {label: "Standard", value: false}];
  public user: User;
  private modal: Modal;
  public dataPublishedDate: string = null;

  constructor(dataService: TraceDataService, messageService: MessageService, modal: Modal) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.modal = modal;
  }

  ngOnInit(): void {
    this.messageService.getGotUser().subscribe(user => this.onGotUserData(user));
    // Subscribing to messageService dataPublishedDate observable variable
    this.messageService.getDataPublishedDate().subscribe((dataPublishedDate) => this.onGotLastDataPublishedDate(dataPublishedDate));
  }

  private onGotUserData(user: User) {
    this.user = user;
    this.showSwitchUser = user.admin;
  }

  private switchUserView() {
    this.messageService.switchUserView();
  }

  public showFeedbackModal() {
    return this.modal.open(FeedbackFormComponent, overlayConfigFactory({user: this.user.name}, BSModalContext));
  }

  private onGotLastDataPublishedDate(dataPublishedDate: string) {
    this.dataPublishedDate = dataPublishedDate;
  }
}
