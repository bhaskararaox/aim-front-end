import {BSModalContext} from "angular2-modal/plugins/bootstrap";
import {TraceResult} from "../../models/app.traceresult";


export class DetailsModalContext extends BSModalContext {
  public trace : TraceResult;
  public highlight : string;
}
