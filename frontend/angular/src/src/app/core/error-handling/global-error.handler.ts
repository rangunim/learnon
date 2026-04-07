import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly messageService = inject(MessageService);

    handleError(error: unknown): void {
        console.error('[GlobalErrorHandler]', error);

        const message = error instanceof Error ? error.message : 'Nieznany błąd aplikacji';

        this.messageService.add({
            severity: 'error',
            summary: 'Błąd aplikacji',
            detail: message,
            life: 5000
        });
    }
}
