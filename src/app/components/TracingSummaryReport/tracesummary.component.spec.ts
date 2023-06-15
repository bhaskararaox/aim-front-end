import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceSummaryComponent } from './tracesummary.component';

describe('TraceSummaryComponent', () => {
  let component: TraceSummaryComponent;
  let fixture: ComponentFixture<TraceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
