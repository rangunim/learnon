import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Chapter } from '../../../../model/chapter.model';
import { PublicChapterCard } from '../marketplace.localstore';


@Component({
  selector: 'app-public-chapter-card',
  imports: [CommonModule, ButtonModule, CardModule, TagModule, TooltipModule],
  templateUrl: './public-chapter-card.component.html',
  styleUrl: './public-chapter-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicChapterCardComponent {
  readonly viewModel = input.required<PublicChapterCard>();

  readonly onImport = output<Chapter>();
  readonly onPreview = output<Chapter>();

  protected import(event: Event): void {
    event.stopPropagation();
    this.onImport.emit(this.viewModel().chapter);
  }

  protected preview(event: Event): void {
    event.stopPropagation();
    this.onPreview.emit(this.viewModel().chapter);
  }

}
