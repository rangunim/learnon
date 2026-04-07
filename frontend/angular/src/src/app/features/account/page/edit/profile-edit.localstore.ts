import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthStore, User } from '../../../../core/stores/auth.store';
import { AccountService } from '../../account.service';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface ProfileEditState {
    isLoading: boolean;
    avatarPreview: string | null;
}

export interface ProfileEditViewModel {
    state: ProfileEditState;
    user: User | null;
    form: FormGroup;
}

@Injectable()
export class ProfileEditLocalStore {
    private readonly authStore = inject(AuthStore);
    private readonly accountService = inject(AccountService);
    private readonly router = inject(Router);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly fb = inject(FormBuilder);

    private readonly _editForm: FormGroup = this.fb.nonNullable.group({
        oldPassword: [''],
        newPassword: ['']
    });

    private readonly _state = signal<ProfileEditState>({
        isLoading: false,
        avatarPreview: this.authStore.user()?.avatarUrl || null
    });

    public readonly viewModel = computed<ProfileEditViewModel>(() => {
        const state = this._state();
        return {
            state: state,
            user: this.authStore.user(),
            form: this._editForm
        };
    });

    public updateAvatarPreview(url: string | null): void {
        this._state.update(s => ({ ...s, avatarPreview: url }));
    }

    public removeAvatar(): void {
        this.confirmationService.confirm({
            message: 'Czy na pewno chcesz usunąć swój aktualny awatar?',
            header: 'Usuwanie awatara',
            icon: 'pi pi-info-circle text-blue-500',
            acceptLabel: 'Tak',
            rejectLabel: 'Nie',
            acceptButtonStyleClass: 'p-button-danger rounded-xl',
            rejectButtonStyleClass: 'p-button-text rounded-xl',
            accept: () => {
                this._state.update(s => ({ ...s, avatarPreview: null }));
                this.saveChanges({ avatarUrl: undefined });
            }
        });
    }

    public deleteAccount(): void {
        this.confirmationService.confirm({
            message: 'Czy na pewno chcesz usunąć całe swoje konto? Ta akcja jest nieodwracalna i utracisz wszystkie swoje rozdziały oraz wyniki w grach.',
            header: 'Trwałe usuwanie konta',
            icon: 'pi pi-exclamation-triangle text-red-500',
            acceptLabel: 'Tak, usuń',
            rejectLabel: 'Anuluj',
            acceptButtonStyleClass: 'p-button-danger rounded-xl',
            rejectButtonStyleClass: 'p-button-text rounded-xl',
            accept: () => {
                this.accountService.deleteAccount().subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usunięto',
                            detail: 'Twoje konto zostało trwale usunięte.'
                        });
                        this.router.navigate(['/']);
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Błąd',
                            detail: 'Nie udało się usunąć konta.'
                        });
                    }
                });
            }
        });
    }

    public saveChanges(partialData: Partial<User>, onComplete?: () => void): void {
        this._state.update(s => ({ ...s, isLoading: true }));
        this.accountService.updateProfile(partialData).subscribe({
            next: () => {
                this._state.update(s => ({ ...s, isLoading: false }));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sukces',
                    detail: 'Twoje dane zostały zaktualizowane.'
                });
                if (onComplete) onComplete();
            },
            error: () => {
                this._state.update(s => ({ ...s, isLoading: false }));
                this.messageService.add({ severity: 'error', summary: 'Błąd', detail: 'Wystąpił błąd podczas zapisywania zmian.' });
            }
        });
    }

    public handleFileSelected(event: unknown): void {
        const input = event as Event;
        const file = (input.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = (e.target as FileReader).result as string;
                this.updateAvatarPreview(result);
            };
            reader.readAsDataURL(file);
        }
    }

    public onSubmit(): void {
        if (this._editForm.invalid) return;

        const partialData: Partial<User> = {};
        const vals = this._editForm.getRawValue();
        const vm = this.viewModel();

        if (vals.newPassword) {
            partialData['password'] = vals.newPassword;
        }

        if (vm.state.avatarPreview !== (vm.user?.avatarUrl || null)) {
            partialData.avatarUrl = vm.state.avatarPreview ?? undefined;
        }

        if (Object.keys(partialData).length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Brak zmian',
                detail: 'Nie wprowadzono żadnych zmian do zapisania.'
            });
            return;
        }

        this.saveChanges(partialData, () => this._editForm.reset());
    }

    public onReset(): void {
        this._editForm.reset();
        this._state.update(s => ({ ...s, avatarPreview: this.authStore.user()?.avatarUrl || null }));
    }
}
