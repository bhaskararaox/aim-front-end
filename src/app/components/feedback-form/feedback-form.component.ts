import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {DialogRef, ModalComponent} from "angular2-modal";
import {Modal} from "angular2-modal/plugins/bootstrap";
import {MessageService} from "../../services/app.messageservice";
import {TraceDataService} from "../../services/app.tracedataservice";
import {AppFeedbackRequest} from "../../models/app.feedbackrequest";
import {Message} from "primeng/primeng";
import {FeedbackFormModalContext} from "./feedback-form.modalcontext";

@Component({
  selector: "app-feedback-form",
  templateUrl: "./feedback-form.component.html",
  styleUrls: ["./feedback-form.component.css"],
  providers: [],
  encapsulation : ViewEncapsulation.None
})
export class FeedbackFormComponent implements OnInit, ModalComponent<FeedbackFormModalContext> {

  private dataService: TraceDataService;
  private messageService: MessageService;
  public dialog: DialogRef<FeedbackFormModalContext>;
  private modal: Modal;
  public messages: Message[] = [];
  public feedbackRequest: AppFeedbackRequest;

  constructor(messageService: MessageService, dataService: TraceDataService, dialog: DialogRef<FeedbackFormModalContext>, modal: Modal) {
    this.dataService = dataService;
    this.messageService = messageService;
    this.dialog = dialog;
    this.modal = modal;
    this.feedbackRequest = new AppFeedbackRequest();
  }

  ngOnInit(): void {
    this.feedbackRequest.user  = this.dialog.context.user;
    this.feedbackRequest.type = "Feedback";
    this.feedbackRequest.priority = "Low";
  }

  public submitRequest() {
    this.dataService.sendFeedbackRequest(this.feedbackRequest).subscribe(result => {
      if (!result) {
        this.messageService.showErrorMessage("Request Error", "Cannot send this feedback request");
      } else {
        this.messageService.showSuccessMessage("Successful Request", "Feedback request sent!");
        this.dialog.close();
      }
    });
  }

  public isFormEmpty() {
    if (!this.feedbackRequest.shortDescription || this.feedbackRequest.shortDescription === ""
      || !this.feedbackRequest.description || this.feedbackRequest.description === "") {
      return true;
    }
    return false;
  }
}
