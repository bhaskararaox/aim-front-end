export class ChartConfig {
  title: string;
  hAxis: string;
  vAxis: string;
  legend: string;
  slantedText: boolean;
  slantedTextAngle: number;
  chartType: string;
  isMultiMetric: boolean;

  constructor(chartType: string, isMultiMetric: boolean = false, title: string, hAxis: string, vAxis: string,
              legend: string = "none", slantedText: boolean = true, slantedTextAngle: number = 90) {
    this.title = title;
    this.hAxis = hAxis;
    this.vAxis = vAxis;
    this.legend = legend;
    this.slantedText = slantedText;
    this.slantedTextAngle = slantedTextAngle;
    this.chartType = chartType;
    this.isMultiMetric = isMultiMetric;
  }
}
