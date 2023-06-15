import {TraceAttribute} from "./app.traceattribute";
import {Query} from "../components/searchbox/models/searchbox.query";
import {AvailableField} from "../components/searchbox/models/searchbox.availablefield";


export class SearchData {

  public input: string;
  public traceAttributes: TraceAttribute[];
  public instructionSequence: string;
  public query: Query;
  public fields: AvailableField[];
  public shareId: string;

  constructor(input: string,
              traceAttribute: TraceAttribute[],
              instructionSequence: string = null,
              query: Query = null,
              fields: AvailableField[] = null,
              shareId: string = null) {
    this.input = input;
    this.traceAttributes = traceAttribute;
    this.instructionSequence = instructionSequence;
    this.query = query;
    this.fields = fields;
    this.shareId = shareId;
  }
}
