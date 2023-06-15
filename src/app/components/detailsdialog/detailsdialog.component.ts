import {Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {MessageService} from "../../services/app.messageservice";
import {Modal} from 'angular2-modal/plugins/bootstrap';
import {CloseGuard, DialogRef, ModalComponent} from "angular2-modal";
import {DetailsModalContext} from "./detailsdialog.modalcontext";
import {NameValue} from "../../models/app.namevalue";
import {AppUtilities} from "../../app.utilities";
import {InstructionRow} from "./models/detailsdialog.instructionrow";


@Component({
  selector: "detailsdialog",
  templateUrl: "./detailsdialog.component.html",
  styleUrls: ["../../app.component.css"],
  providers: [],
  encapsulation : ViewEncapsulation.None
})

export class DetailsDialogComponent implements OnInit, OnDestroy, CloseGuard, ModalComponent<DetailsModalContext> {

  public dialog: DialogRef<DetailsModalContext>;
  private messageService: MessageService;
  private modal: Modal;
  public instructionTable: InstructionRow[];
  public xedMetric: String;
  public xedTable: NameValue[];

  constructor(messageService: MessageService, dialog: DialogRef<DetailsModalContext>, modal: Modal) {
    this.messageService = messageService;
    this.modal = modal;
    this.dialog = dialog;
  }

  public beforeDismiss(): boolean | Promise<boolean> {
    return true;
  }

  public beforeClose(): boolean | Promise<boolean> {
    return true;
  }

  public ngOnInit(): void {
    this.instructionTable = this.getInstructionsTable(AppUtilities.getTable(this.dialog.context.trace.instructions));
    this.xedMetric = "ISA Extension";
    this.xedTable = AppUtilities.getTable(this.dialog.context.trace.isas);
  }

  public showHighlight(): boolean {
    return this.dialog.context.highlight != null && this.dialog.context.highlight != "";
  }

  public getXEDMetricTable() {
    switch (this.xedMetric) {
      case "ISA Extension":
        this.xedTable = AppUtilities.getTable(this.dialog.context.trace.isas);
        break;
      case "ISA Set":
        this.xedTable = AppUtilities.getTable(this.dialog.context.trace.isaSets);
        break;
      case "Category":
        this.xedTable = AppUtilities.getTable(this.dialog.context.trace.categories);
        break;
      case "IForm":
        this.xedTable = AppUtilities.getTable(this.dialog.context.trace.iforms);
        break;
      default:
        break;
    }
}

  private getInstructionsTable(instructions: NameValue[]) {
    let sum = instructions.map(it => it.value).reduce((a, b) => {
      return (Number(a) + Number(b));
    }, 0);

    let table : InstructionRow[]  = [];
    for (let nameValue of instructions) {
      let percentage = ((Number(nameValue.value))/sum) * 100;
      let percentageString = percentage.toFixed(5) + "%";
      table.push(new InstructionRow(nameValue.name, Number(nameValue.value), percentageString));
    }

    return table;
  }

  public ngOnDestroy(): void {

  }
}
