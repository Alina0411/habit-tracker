import { Routes } from '@angular/router';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {HabitDetailComponent, HabitListComponent} from './features/habit';

export const routes: Routes = [
  {
    path: 'habits',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'list', component: HabitListComponent },
      { path: ':id', component: HabitDetailComponent }
    ]
  },
  { path: '', redirectTo: 'habits', pathMatch: 'full' },
  { path: '**', redirectTo: 'habits' }
];

