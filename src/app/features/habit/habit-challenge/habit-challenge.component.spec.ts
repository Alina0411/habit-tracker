import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitChallengeComponent } from './habit-challenge.component';

describe('HabitChallengeComponent', () => {
  let component: HabitChallengeComponent;
  let fixture: ComponentFixture<HabitChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitChallengeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
