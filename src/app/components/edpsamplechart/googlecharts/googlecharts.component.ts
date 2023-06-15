import {Component, Input, OnInit} from '@angular/core';
import {ChartConfig} from '../model/chartConfig';
import {GoogleScatterChartService} from './../../../services/google-scatter-chart.service';
import {GoogleLineChartService} from './../../../services/google-line-chart.service';

declare var google: any;

@Component({
  selector: 'app-googlecharts',
  templateUrl: './googlecharts.component.html',
  styleUrls: ['./googlecharts.component.css']
})
export class GooglechartsComponent implements OnInit {

  @Input() data: any[];
  @Input() config: ChartConfig;
  @Input() elementId: string;
  @Input() chartSelection: string;

  constructor(private scatterChartService: GoogleScatterChartService, private lineChartService: GoogleLineChartService) {
  }

  ngOnInit(): void {
    console.log(this.config.chartType)
    this.updateChart();
  }

  public updateChart() {

    if (this.config.chartType === "trendLine") {
      this.scatterChartService.buildScatterChart(this.elementId, this.data, this.config);
    } else {
      this.lineChartService.buildLineChart(this.elementId, this.data, this.config);
    }
  }
}
