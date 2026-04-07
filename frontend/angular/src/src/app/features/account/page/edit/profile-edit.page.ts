import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { ProfileEditLocalStore, ProfileEditViewModel } from './profile-edit.localstore';

@Component({
    selector: 'app-profile-edit',
    imports: [ReactiveFormsModule, RouterModule, Button, Password],
    providers: [ProfileEditLocalStore],
    templateUrl: './profile-edit.page.html',
    styleUrl: './profile-edit.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditPage {
    private readonly store = inject(ProfileEditLocalStore);
    readonly viewModel: Signal<ProfileEditViewModel> = this.store.viewModel;

    protected onSubmit(): void {
        this.store.onSubmit();
    }

    protected onReset(): void {
        this.store.onReset();
    }

    protected onFileSelected(event: unknown): void {
        this.store.handleFileSelected(event);
    }

    protected removeAvatar(): void {
        this.store.removeAvatar();
    }

    protected deleteAccount(): void {
        this.store.deleteAccount();
    }
}
