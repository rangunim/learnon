import { computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { signalStore, withState, withComputed, withMethods, patchState, getState, withHooks } from '@ngrx/signals';
import { AuthStoreService } from './auth-store.service';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
    avatarUrl?: string;
    password?: string;
}

export interface AuthState {
    user: User | null;
}

const initialState: AuthState = {
    user: null
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ user }) => ({
        isLoggedIn: computed(() => user() !== null),
    })),
    withMethods((store, service = inject(AuthStoreService)) => ({
        handleLogin: (email: string, password: string): Observable<AuthState> =>
            service.handleLogin(getState(store), email, password).pipe(
                tap(newState => patchState(store, newState))
            ),
        handleRegister: (userData: User): Observable<AuthState> =>
            service.handleRegister(getState(store), userData).pipe(
                tap(newState => patchState(store, newState))
            ),
        handleUpdate: (userData: Partial<User>): Observable<AuthState> =>
            service.handleUpdate(getState(store), userData).pipe(
                tap(newState => patchState(store, newState))
            ),
        handleDelete: (): Observable<AuthState> =>
            service.handleDelete(getState(store)).pipe(
                tap(newState => patchState(store, newState))
            ),
        handleLogout: (): void => {
            patchState(store, service.handleLogout(getState(store)));
        }
    })),
    withHooks({
        onInit(store) {
            const service = inject(AuthStoreService);
            const restored = service.handleRestore();
            if (restored) {
                patchState(store, restored);
            }
        }
    })
);
