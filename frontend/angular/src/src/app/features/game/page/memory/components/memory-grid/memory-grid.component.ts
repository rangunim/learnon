import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MemoryCard, MemoryViewModel } from '../../memory.localstore';

@Component({
  selector: 'app-memory-grid',
  standalone: true,
  imports: [],
  templateUrl: './memory-grid.component.html',
  styleUrl: './memory-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemoryGridComponent {
  readonly viewModel = input.required<MemoryViewModel>();
  readonly flipCard = output<MemoryCard>();

  protected onCardClick(card: MemoryCard): void {
    this.flipCard.emit(card);
  }
}
