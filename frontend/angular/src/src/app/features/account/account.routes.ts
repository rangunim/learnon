import { Routes } from '@angular/router';
import { ProfileViewPage } from './page/view/profile-view.page';
import { ProfileEditPage } from './page/edit/profile-edit.page';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: 'profile',
        component: ProfileViewPage
    },
    {
        path: 'edit',
        component: ProfileEditPage
    },
    {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
    }
];
