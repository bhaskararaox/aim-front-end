import { Component, Input, OnInit } from '@angular/core';
import { GooglePieChartService } from '../../../services/google-pie-chart.service';
import { PieChartConfig } from './../../dashboard/models/PieChartConfig';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {

  @Input() data: any[];
  @Input() config: PieChartConfig;
  @Input() elementId: string;

  constructor(private _pieChartService: GooglePieChartService) {}

  ngOnInit(): void {
    this._pieChartService.buildPieChart(this.elementId, this.data, this.config);
  }
}
