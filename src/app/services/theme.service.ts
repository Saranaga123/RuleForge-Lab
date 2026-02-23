import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  constructor() {
    this.loadTheme(); // Apply saved theme on app start
  }

  setTheme(isDarkMode: boolean): void {
    const themeClass = isDarkMode ? 'dark-theme' : '';
    document.body.className = themeClass;
    localStorage.setItem(this.THEME_KEY, themeClass);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      document.body.className = savedTheme;
    }
  }
}

