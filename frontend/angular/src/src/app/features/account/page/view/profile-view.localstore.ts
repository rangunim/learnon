import { Injectable, computed, inject } from '@angular/core';
import { AuthStore, User } from '../../../../core/stores/auth.store';

export interface ProfileViewViewModel {
    state: User | null;
}

@Injectable()
export class ProfileViewLocalStore {
    private readonly authStore = inject(AuthStore);

    public readonly viewModel = computed<ProfileViewViewModel>(() => {
        const user = this.authStore.user();
        return {
            state: user
        };
    });
}
