export class SummaryByIsa {
  public Workload: string;
  public Component: string;
  public IsaExtension: string;
  public UnweightedPercentage: number;
  public WeightedPercentage: number;

  constructor(Workload: string, Component: string, IsaExtension: string, UnweightedPercentage: number, WeightedPercentage: number) {
    this.Workload = Workload;
    this.Component = Component;
    this.IsaExtension = IsaExtension;
    this.UnweightedPercentage = UnweightedPercentage;
    this.WeightedPercentage = WeightedPercentage;
  }
}
