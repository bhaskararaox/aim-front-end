import { Injectable } from '@angular/core';
import { GoogleChartsBaseService } from './google-charts-base.service';
import { PieChartConfig } from './../components/dashboard/models/PieChartConfig';

declare var google: any;

@Injectable()
export class GooglePieChartService extends GoogleChartsBaseService  {

  constructor() { super(); }

  public buildPieChart(elementId: string, data: any[], config: PieChartConfig) : void {

    var chartFunc = () => { return new google.visualization.PieChart(document.getElementById(elementId)); };
    var options = {
      title: config.title,
      pieHole: config.pieHole,
      'width':700,
      'height':500,
      is3D: true,
      sliceVisibilityThreshold: 0
    };

    this.buildChart(data, chartFunc, options);
  }

}
