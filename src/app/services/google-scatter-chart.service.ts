import { Injectable } from '@angular/core';
import { GoogleChartsBaseService } from './google-charts-base.service';
import {ChartConfig} from '../components/edpsamplechart/model/chartConfig'
declare var google: any;

@Injectable()
export class GoogleScatterChartService  extends GoogleChartsBaseService {

  constructor() { super(); }

  public buildScatterChart(elementId: string, data: any[], config: ChartConfig): void {

    const chartFunc = () => { return new google.visualization.ScatterChart(document.getElementById(elementId)); };
    const options = {
      title: config.title,
      hAxis: {title: config.hAxis, slantedText: config.slantedText, slantedTextAngle: config.slantedTextAngle, interpolateNulls: false},
      vAxis: {title: config.vAxis},
      trendlines: {
        0: {
          type: "linear",
          showR2: true,
          visibleInLegend: true,
          color: "green"
        }
      }
    };

    this.buildChart(data, chartFunc, options);
  }
}
