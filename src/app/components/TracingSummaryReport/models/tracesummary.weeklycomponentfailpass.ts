export class WeeklyComponentPassFail {
  public weeklyComponentDate: String;
  public weeklyComponentPass: Number;
  public weeklyComponentFail: Number;

  constructor(weeklyComponentDate: String, weeklyComponentPass: Number, weeklyComponentFail: Number) {
    this.weeklyComponentDate = weeklyComponentDate;
    this.weeklyComponentPass = weeklyComponentPass;
    this.weeklyComponentFail = weeklyComponentFail;
  }
}
