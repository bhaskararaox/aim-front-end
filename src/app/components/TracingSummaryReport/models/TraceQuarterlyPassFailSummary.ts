export class TraceQuarterlyPassFailSummary {
  public quarter: String;
  public pass: Number;
  public fail: Number;
  public processig: Number;

  constructor(quarter: String, pass: Number, fail: Number, processing: Number) {
    this.quarter = quarter;
    this.pass = pass;
    this.fail = fail;
    this.processig = processing
  }
}
