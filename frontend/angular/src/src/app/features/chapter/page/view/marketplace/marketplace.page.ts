import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MarketplaceLocalStore, MarketplaceSearchField } from './marketplace.localstore';
import { PublicChapterCardComponent } from './components/public-chapter-card.component';
import { Chapter } from '../../../model/chapter.model';
import { Select } from 'primeng/select';

import { TooltipModule } from 'primeng/tooltip';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        InputTextModule,
        ButtonModule,
        ProgressSpinnerModule,
        PublicChapterCardComponent,
        TooltipModule,
        Select
    ],
    providers: [MarketplaceLocalStore],
    templateUrl: './marketplace.page.html',
    styleUrl: './marketplace.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePage implements OnInit {
    private readonly localStore = inject(MarketplaceLocalStore);

    protected readonly viewModel = this.localStore.viewModel;

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    protected readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

    protected readonly searchFields = [
        { label: 'Tytuł', value: 'title' },
        { label: 'Email', value: 'authorEmail' },
        { label: 'Autor', value: 'authorName' }
    ];

    ngOnInit(): void {
        this.localStore.loadPublicChapters();
    }

    protected handleSearch(query: string): void {
        this.localStore.loadPublicChapters(query);
    }

    protected onDialogShow(): void {
        const input = this.searchInputRef()?.nativeElement;
        if (input) {
            setTimeout(() => input.focus(), 800);
        }
    }

    protected handleSearchFieldChange(field: MarketplaceSearchField): void {
        this.localStore.setSearchField(field);
    }

    protected refresh(): void {
        const query = this.viewModel().state.searchQuery;
        this.localStore.loadPublicChapters(query);
    }

    protected handleImport(chapter: Chapter): void {
        this.localStore.importChapter(chapter);
    }

    protected handlePreview(chapter: Chapter): void {
        this.localStore.showPreview(chapter);
    }

    protected closePreview(): void {
        this.localStore.hidePreview();
    }

    protected closeDialog(): void {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
}
