import { TestBed, inject } from '@angular/core/testing';

import { GoogleChartsBaseService } from './google-charts-base.service';

describe('GoogleChartsBaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleChartsBaseService]
    });
  });

  it('should be created', inject([GoogleChartsBaseService], (service: GoogleChartsBaseService) => {
    expect(service).toBeTruthy();
  }));
});
