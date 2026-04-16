import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { ProfileViewLocalStore, ProfileViewViewModel } from './profile-view.localstore';

@Component({
    imports: [RouterModule, Button, DatePipe],
    providers: [ProfileViewLocalStore],
    templateUrl: './profile-view.page.html',
    styleUrl: './profile-view.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewPage {
    private readonly store = inject(ProfileViewLocalStore);
    readonly viewModel: Signal<ProfileViewViewModel> = this.store.viewModel;
}
