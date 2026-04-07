import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly messageService = inject(MessageService);

    constructor() {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates
                .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Nowa wersja dostępna',
                        detail: 'Aplikacja została zaktualizowana. Kliknij tutaj, aby odświeżyć.',
                        sticky: true,
                        key: 'pwa-update',
                        data: { action: 'reload' }
                    });
                });
        }
    }
}
