import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError, retry } from 'rxjs';
import { AuthStore } from '../stores/auth.store';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const messageService = inject(MessageService);
    const router = inject(Router);
    const authStore = inject(AuthStore);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            console.error(`[HTTP Error] ${req.method} ${req.url}`, {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                body: error.error
            });

            switch (error.status) {
                case 0:
                    messageService.add({
                        severity: 'error',
                        summary: 'Brak połączenia',
                        detail: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.',
                        life: 5000
                    });
                    break;

                case 401:
                    messageService.add({
                        severity: 'warn',
                        summary: 'Sesja wygasła',
                        detail: 'Zaloguj się ponownie.',
                        life: 4000
                    });
                    authStore.handleLogout();
                    router.navigate(['/login']);
                    break;

                case 403:
                    messageService.add({
                        severity: 'warn',
                        summary: 'Brak dostępu',
                        detail: 'Nie masz uprawnień do tej operacji.',
                        life: 4000
                    });
                    break;

                case 404:
                    messageService.add({
                        severity: 'error',
                        summary: 'Nie znaleziono',
                        detail: 'Żądany zasób nie istnieje.',
                        life: 4000
                    });
                    break;

                case 500:
                case 502:
                case 503:
                    messageService.add({
                        severity: 'error',
                        summary: 'Błąd serwera',
                        detail: 'Wystąpił problem po stronie serwera. Spróbuj ponownie później.',
                        life: 5000
                    });
                    break;

                default:
                    messageService.add({
                        severity: 'error',
                        summary: 'Błąd',
                        detail: `Wystąpił nieoczekiwany błąd (${error.status}).`,
                        life: 5000
                    });
            }

            return throwError(() => error);
        })
    );
};
