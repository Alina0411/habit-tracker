import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreakChartComponent } from './streak-chart.component';

describe('StreakChartComponent', () => {
  let component: StreakChartComponent;
  let fixture: ComponentFixture<StreakChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreakChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreakChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
