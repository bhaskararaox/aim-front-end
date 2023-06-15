import {AppEmonMetricData} from "./app.emonmetricdata";

export class AppEmonTableData {
  public metricColValue: string;
  public rsquaredColValue: string;
  public pearsonColValue: string;
  public frequencyColValue: string;
  public chartData: AppEmonMetricData[];

  constructor(metricValue: string, correlationData: AppEmonMetricData[], rsquared: string, pearson: string, frequency: string) {
    this.metricColValue = metricValue;
    this.rsquaredColValue = rsquared;
    this.pearsonColValue = pearson;
    this.frequencyColValue = frequency;
    this.chartData = correlationData;
  }
}
