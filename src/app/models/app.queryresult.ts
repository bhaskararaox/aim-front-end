import {TraceResult} from "./app.traceresult";

export class QueryResult {
  public data: TraceResult[];
  public isAuthorized: boolean;
  //public count : number;
  public totalElements: number;
  public totalDistinctWorkloads: number;
  public totalDistinctComponents: number;
  public dataPublishedDate: string;
}
