import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { HabitService, NewHabit, ThemeService } from '../../core';
import { HabitDialogComponent } from '../../features/habit';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButton, MatIconButton, RouterLink, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private dialog = inject(MatDialog);
  habitService = inject(HabitService);
  themeService = inject(ThemeService);
  isHomePage = signal<boolean>(false);
  router = inject(Router);

  openAddHabitDialog(): void {
    const dialogRef = this.dialog.open(HabitDialogComponent);
    dialogRef.afterClosed()
      .pipe(
        filter((res): res is NewHabit => !!res),
        switchMap((res) => this.habitService.createHabit(res))
      )
      .subscribe({
        next: () => {},
        error: (err) => console.error('Ошибка при добавлении привычки:', err),
      });
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;
    this.isHomePage.set(currentUrl === '/habits');
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.isHomePage.set(event.urlAfterRedirects === '/habits');
      });
  }
}
