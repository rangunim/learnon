import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthStore } from '../../../../core/stores/auth.store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginState {
    isLoading: boolean;
    errorMessage: string | null;
}

export interface LoginViewModel {
    state: LoginState;
    form: FormGroup;
    isValid: boolean;
    canSubmit: boolean;
}

@Injectable()
export class LoginLocalStore {
    private readonly authStore = inject(AuthStore);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    private readonly _loginForm: FormGroup = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    private readonly _formChanges = toSignal(this._loginForm.valueChanges, {
        initialValue: this._loginForm.getRawValue()
    });

    private readonly _formStatus = toSignal(this._loginForm.statusChanges, {
        initialValue: this._loginForm.status
    });

    private readonly _state = signal<LoginState>({
        isLoading: false,
        errorMessage: null
    });

    public readonly viewModel = computed<LoginViewModel>(() => {
        const state = this._state();
        const status = this._formStatus();
        this._formChanges();

        return {
            state: state,
            form: this._loginForm,
            isValid: status === 'VALID',
            canSubmit: status === 'VALID' && !state.isLoading
        };
    });

    public onSubmit(): void {
        if (this._loginForm.invalid) return;

        const credentials = this._loginForm.getRawValue() as LoginCredentials;
        this._state.set({ isLoading: true, errorMessage: null });

        this.authStore.handleLogin(credentials.email, credentials.password).subscribe({
            next: () => {
                this._state.set({ isLoading: false, errorMessage: null });
                this.router.navigate(['/chapters']);
            },
            error: () => {
                this._state.set({
                    isLoading: false,
                    errorMessage: 'Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.'
                });
            }
        });
    }
}
