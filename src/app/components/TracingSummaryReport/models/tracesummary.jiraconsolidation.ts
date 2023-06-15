
export class JiraConsolidation {
  public  tracingRequestsReceived: Number;
  public  tracingRequestCompleted: Number;
  public  pbtrequestReceived: Number;
  public  pbtRequestCompleted: Number;


  constructor(tracingRequestsReceived: Number, tracingRequestCompleted: Number, pbtrequestReceived: Number, pbtRequestCompleted: Number) {
    this.tracingRequestsReceived = tracingRequestsReceived;
    this.tracingRequestCompleted = tracingRequestCompleted;
    this.pbtrequestReceived = pbtrequestReceived;
    this.pbtRequestCompleted = pbtRequestCompleted;
  }
}
