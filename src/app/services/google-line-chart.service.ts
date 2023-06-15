import {Injectable} from "@angular/core";
import {GoogleChartsBaseService} from "./google-charts-base.service";
import {ChartConfig} from "../components/edpsamplechart/model/chartConfig"

declare var google: any;

@Injectable()
export class GoogleLineChartService extends GoogleChartsBaseService {

  constructor() {
    super();
  }

  public buildLineChart(elementId: string, data: any[], config: ChartConfig): void {

    const chartFunc = () => {
      return new google.visualization.LineChart(document.getElementById(elementId));
    };

    let options = {};

    options = {
      title: config.title,
      curveType: "function",
      hAxis: {title: config.hAxis, slantedText: config.slantedText, slantedTextAngle: config.slantedTextAngle},
      vAxis: {title: config.vAxis},
      interpolateNulls: true
    };

    if (config.isMultiMetric) {
      options = {
        title: config.title,
        curveType: "function",
        hAxis: {title: config.hAxis, slantedText: config.slantedText, slantedTextAngle: config.slantedTextAngle},
        vAxis: {
          title: "Minmax Data Normalization",
          viewWindowMode: "explicit",
          viewWindow: {
            max: 1,
            min: 0
          }
        },
        interpolateNulls: true
      };
    }

    this.buildChart(data, chartFunc, options);
  }
}
