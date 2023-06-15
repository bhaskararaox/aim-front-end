import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdpCustomChartsComponent } from './edp-custom-charts.component';

describe('EdpCustomChartsComponent', () => {
  let component: EdpCustomChartsComponent;
  let fixture: ComponentFixture<EdpCustomChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdpCustomChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdpCustomChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
