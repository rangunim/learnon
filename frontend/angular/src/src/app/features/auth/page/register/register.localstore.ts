import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthStore, User } from '../../../../core/stores/auth.store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface RegisterState {
    isLoading: boolean;
    errorMessage: string | null;
}

export interface RegisterViewModel {
    state: RegisterState;
    form: FormGroup;
    isValid: boolean;
    canSubmit: boolean;
}

@Injectable()
export class RegisterLocalStore {
    private readonly authStore = inject(AuthStore);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    private readonly _registerForm: FormGroup = this.fb.nonNullable.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        birthDate: [null, Validators.required],
        gender: ['Nieznana', Validators.required],
        termsAccepted: [false, Validators.requiredTrue]
    });

    private readonly _formChanges = toSignal(this._registerForm.valueChanges, {
        initialValue: this._registerForm.getRawValue()
    });

    private readonly _formStatus = toSignal(this._registerForm.statusChanges, {
        initialValue: this._registerForm.status
    });

    private readonly _state = signal<RegisterState>({
        isLoading: false,
        errorMessage: null
    });

    public readonly viewModel = computed<RegisterViewModel>(() => {
        const state = this._state();
        const status = this._formStatus();
        this._formChanges();

        return {
            state: state,
            form: this._registerForm,
            isValid: status === 'VALID',
            canSubmit: status === 'VALID' && !state.isLoading

        };
    });

    public onSubmit(): void {
        if (this._registerForm.invalid) return;

        const data = this._registerForm.getRawValue();
        this._state.set({ isLoading: true, errorMessage: null });

        const request: User = {
            id: Math.random().toString(36).substring(2, 9),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            birthDate: data.birthDate instanceof Date ? data.birthDate.toISOString() : undefined,
            gender: data.gender
        };

        this.authStore.handleRegister(request).subscribe({
            next: () => {
                this._state.set({ isLoading: false, errorMessage: null });
                this.router.navigate(['/chapters']);
            },
            error: () => {
                this._state.set({
                    isLoading: false,
                    errorMessage: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.'
                });
            }
        });
    }
}
