import { Route, Routes } from '@angular/router';
import { ChaptersListPage } from './view/list/chapters-list.page';
import { ChapterCreatePage } from './create/chapter-create.page';
import { ChapterDetailPage } from './view/detail/chapter-detail.page';
import { ChapterEditPage } from './edit/chapter-edit.page';
import { MarketplacePage } from './view/marketplace/marketplace.page';

export const CHAPTER_ROUTES: Routes = <Route[]>[
    {
        path: '',
        component: ChaptersListPage,
        children: [
            {
                path: 'marketplace',
                component: MarketplacePage
            }
        ]
    },
    {
        path: 'new',
        component: ChapterCreatePage
    },
    {
        path: ':id',
        component: ChapterDetailPage
    },
    {
        path: ':id/edit',
        component: ChapterEditPage
    }
];
