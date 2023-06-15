
export class HSDSightings {
  public bugsReported: Number;
  public bugsResolved: Number;
  public traceRequests: Number;


  constructor(bugsReported: Number, bugsResolved: Number, traceRequests: Number) {
    this.bugsReported = bugsReported;
    this.bugsResolved = bugsResolved;
    this.traceRequests = traceRequests;
  }
}
