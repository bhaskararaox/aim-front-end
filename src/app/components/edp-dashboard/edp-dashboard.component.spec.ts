import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdpDashboardComponent } from './edp-dashboard.component';

describe('EdpDashboardComponent', () => {
  let component: EdpDashboardComponent;
  let fixture: ComponentFixture<EdpDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdpDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdpDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
