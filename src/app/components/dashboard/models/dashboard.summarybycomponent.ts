export class SummaryByComponent {
  public Workload: string;
  public NumComponents: string;
  public Component: string;
  public NumTraces: number;
  public goldTraces: number;
  public silverTraces: number;
  public bronzeTraces: number;
  public segment: string;

  constructor(Workload: string, NumComponents: string, Component: string, NumTraces: number, goldTraces: number, silverTraces: number, bronzeTraces: number, segment: string){
      this.Workload = Workload;
      this.NumComponents = NumComponents;
      this.Component = Component;
      this.NumTraces = NumTraces;
      this.goldTraces = goldTraces;
      this.silverTraces = silverTraces;
      this.bronzeTraces = bronzeTraces;
      this.segment = segment;
  }
}
