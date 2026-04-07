import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthState, User } from './auth.store';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/users`;

@Injectable({ providedIn: 'root' })
export class AuthStoreService {
    private readonly http = inject(HttpClient);

    handleLogin(state: AuthState, email: string, password: string): Observable<AuthState> {
        return this.http.get<User[]>(`${API_URL}?email=${email}&password=${password}`).pipe(
            map(users => {
                if (users.length <= 0) {
                    throw new Error('Invalid credentials');
                }

                const user = users[0];
                localStorage.setItem('learnon_user', JSON.stringify(user));
                return { user };
            })
        );
    }

    handleRegister(state: AuthState, userData: User): Observable<AuthState> {
        return this.http.post<User>(API_URL, userData).pipe(
            map(user => {
                localStorage.setItem('learnon_user', JSON.stringify(user));
                return { user };
            })
        );
    }

    handleUpdate(state: AuthState, userData: Partial<User>): Observable<AuthState> {
        if (!state.user?.id) throw new Error('Not logged in');
        const updatedUser = { ...state.user, ...userData };
        return this.http.put<User>(`${API_URL}/${state.user.id}`, updatedUser).pipe(
            map(user => {
                localStorage.setItem('learnon_user', JSON.stringify(user));
                return { user };
            })
        );
    }

    handleDelete(state: AuthState): Observable<AuthState> {
        if (!state.user?.id) throw new Error('Not logged in');
        return this.http.delete(`${API_URL}/${state.user.id}`).pipe(
            map(() => {
                localStorage.removeItem('learnon_user');
                return { user: null };
            })
        );
    }

    handleLogout(state: AuthState): AuthState {
        localStorage.removeItem('learnon_user');
        return { user: null };
    }

    handleRestore(): AuthState | null {
        const raw = localStorage.getItem('learnon_user');
        const user = raw ? JSON.parse(raw) : null;
        return user ? { user } : null;
    }
}
