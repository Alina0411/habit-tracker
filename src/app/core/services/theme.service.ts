import { Injectable, signal } from '@angular/core';

// Переключение тёмной/светлой темы, сохраняем выбор в localStorage
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this._applyDark(true);
    }
  }

  toggle(): void {
    this.isDark() ? this._applyDark(false) : this._applyDark(true);
  }

  private _applyDark(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
    this.isDark.set(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
