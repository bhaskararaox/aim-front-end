import {ResultsRaw} from "./datagrid.resultsraw";
import {TraceResult} from "../../../models/app.traceresult";

describe('datagrid.resultsrow', () =>{
  it('date formated year - month', () => {
    let traceResult = new TraceResult();
    //traceResult.attributes["config_published_date"] = "1305";
    let target = new ResultsRaw(traceResult);

    expect(target.date).toBe("2013-05");
  });
});
