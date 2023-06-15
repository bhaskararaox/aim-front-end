import {BSModalContext} from "angular2-modal/plugins/bootstrap";
import {SummaryByComponent} from "../dashboard/models/dashboard.summarybycomponent";

export class ComponentModalContext extends BSModalContext {
  public components:SummaryByComponent[]=[];
}
