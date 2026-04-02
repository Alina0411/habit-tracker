import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitTopComponent } from './habit-top.component';

describe('HabitTopComponent', () => {
  let component: HabitTopComponent;
  let fixture: ComponentFixture<HabitTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitTopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
