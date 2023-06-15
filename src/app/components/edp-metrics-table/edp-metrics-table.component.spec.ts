import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdpMetricsTableComponent } from './edp-metrics-table.component';

describe('EdpMetricsTableComponent', () => {
  let component: EdpMetricsTableComponent;
  let fixture: ComponentFixture<EdpMetricsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdpMetricsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdpMetricsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
