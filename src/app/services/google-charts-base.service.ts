import {Injectable} from '@angular/core';

declare var google: any;

@Injectable()
export class GoogleChartsBaseService {

  constructor() {
    google.charts.load('current', {'packages': ['corechart']});
  }

  protected buildChart(data: any[], chartFunc: any, options: any): void {
    let func = (chartFunc, options) => {
      let datatable = google.visualization.arrayToDataTable(data);
      chartFunc().draw(datatable, options);
    };
    let callback = () => func(chartFunc, options);
    google.charts.setOnLoadCallback(callback);
  }
}
