import {Component} from '@angular/core';
import {CalendarComponent} from "../calendar/calendar.component";
import {HabitTopComponent, ProgressChartComponent, StreakChartComponent} from '../statistics';
import {MatIcon} from '@angular/material/icon';
import {HabitChallengeComponent, HabitListComponent} from '../habit';

@Component({
  selector: 'app-dashboard',
  imports: [
    CalendarComponent,
    HabitListComponent,
    StreakChartComponent,
    ProgressChartComponent,
    HabitTopComponent,
    HabitChallengeComponent,
    MatIcon
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
// Главная страница — собирает все виджеты: список привычек, календарь, графики
export class DashboardComponent {

}
