
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'learnon-theme';

    // Default is light mode as requested
    theme = signal<'light' | 'dark'>(
        (localStorage.getItem(this.THEME_KEY) as 'light' | 'dark') || 'light'
    );

    constructor() {
        effect(() => {
            const currentTheme = this.theme();
            localStorage.setItem(this.THEME_KEY, currentTheme);
            this.applyTheme(currentTheme);
        });
    }

    toggleTheme(): void {
        this.theme.update(t => t === 'light' ? 'dark' : 'light');
    }

    private applyTheme(theme: 'light' | 'dark'): void {
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('p-dark');
            // Adding 'dark' for tailwind standard as well just in case
            html.classList.add('dark');
        } else {
            html.classList.remove('p-dark');
            html.classList.remove('dark');
        }
    }
}
