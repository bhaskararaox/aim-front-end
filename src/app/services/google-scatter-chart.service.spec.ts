import { TestBed, inject } from '@angular/core/testing';

import { GoogleScatterChartService } from './google-scatter-chart.service';

describe('GoogleScatterChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleScatterChartService]
    });
  });

  it('should be created', inject([GoogleScatterChartService], (service: GoogleScatterChartService) => {
    expect(service).toBeTruthy();
  }));
});
