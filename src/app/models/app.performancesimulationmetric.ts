export class PerformanceSimulationMetric {
  public metric : string;
  public config : string;
  public value : string;

  constructor(metric: string, config: string, value: string) {
    this.metric = metric;
    this.config = config;
    this.value = value;
  }
}
