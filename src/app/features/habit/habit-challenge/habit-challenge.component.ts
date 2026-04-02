import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { Subject } from 'rxjs';
import {AsyncPipe} from '@angular/common';
import { HabitService} from '../../../core';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-habit-challenge',
  standalone: true,
  imports: [
    AsyncPipe,
    MatIcon,
  ],
  templateUrl: './habit-challenge.component.html',
  styleUrl: './habit-challenge.component.scss'
})
// Блок челленджей — привычки с дедлайном, разделённые на активные и архивные
export class HabitChallengeComponent implements  OnDestroy {
  private destroy$ = new Subject<void>();
  habitService = inject(HabitService);
  selectedTab: 'active' | 'archived' = 'active';

  activeHabits$ =  this.habitService.activeChallengeHabits$

  archivedHabits$ = this.habitService.archivedChallengeHabits$

  get habits$() {
    return this.selectedTab === 'active' ? this.activeHabits$ : this.archivedHabits$;
  }

  getColorPercent(progress: { doneDays: number; totalDays: number }) {
    if (progress.totalDays === 0) return '0%';
    const progressPercent = Math.round((progress.doneDays / progress.totalDays) * 100);
    return `${progressPercent}%`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
