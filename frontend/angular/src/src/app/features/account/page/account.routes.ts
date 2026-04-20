import { Route, Routes } from '@angular/router';
import { ProfileViewPage } from './view/profile-view.page';
import { ProfileEditPage } from './edit/profile-edit.page';

export const ACCOUNT_ROUTES: Routes = <Route[]>[
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
