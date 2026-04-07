import { Route, Routes } from '@angular/router';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from './core/stores/auth.store';
import { LandingPage } from './features/home/landing/landing.page';


const authGuard: CanActivateFn = (route, state) => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (authStore.isLoggedIn()) {
        return true;
    }

    return router.parseUrl('/login');
};

const publicGuard: CanActivateFn = (route, state) => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (authStore.isLoggedIn()) {
        return router.parseUrl('/chapters');
    }

    return true;
};


export const routes: Routes = [
    <Route>{
        path: '',
        component: LandingPage
    },
    <Route>{
        path: 'auth',
        canActivate: [publicGuard],
        loadChildren: () => import('./features/auth/page/auth.routes').then(m => m.AUTH_ROUTES)
    },
    <Route>{
        // Aliases for retro-compatibility (or we can just keep them un-prefixed)
        path: 'login',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    <Route>{
        path: 'register',
        redirectTo: 'auth/register',
        pathMatch: 'full'
    },
    <Route>{
        path: 'chapters/:id/play',
        canActivate: [authGuard],
        loadChildren: () => import('./features/game/page/game.routes').then(m => m.GAME_ROUTES)
    },
    <Route>{
        path: 'chapters',
        canActivate: [authGuard],
        loadChildren: () => import('./features/chapter/page/chapter.routes').then(m => m.CHAPTER_ROUTES)
    },
    <Route>{
        path: 'account',
        canActivate: [authGuard],
        loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES)
    },

    // Catch all
    <Route>{ path: '**', redirectTo: '' }
];
