import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStore, AuthState, User } from '../../core/stores/auth.store';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private readonly authStore = inject(AuthStore);

    public updateProfile(userData: Partial<User>): Observable<AuthState> {
        return this.authStore.handleUpdate(userData);
    }

    public deleteAccount(): Observable<AuthState> {
        return this.authStore.handleDelete();
    }
}
