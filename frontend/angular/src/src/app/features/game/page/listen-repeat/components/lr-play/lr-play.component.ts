import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { ToggleButton } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { FormsModule } from '@angular/forms';
import { PlayViewModel } from '../../listen-repeat.localstore';

@Component({
    selector: 'app-lr-play',
    imports: [Button, ToggleButton, FormsModule, TooltipModule, ProgressBar],
    templateUrl: './lr-play.component.html',
    styleUrl: './lr-play.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LrPlayComponent {
    readonly viewModel = input.required<PlayViewModel>();

    readonly nextWord = output<void>();
    readonly toggleAutoListen = output<void>();
    readonly toggleWord = output<void>();
    readonly playAudio = output<void>();
    readonly startListening = output<void>();

    protected onNextWord(): void {
        this.nextWord.emit();
    }

    protected onToggleAutoListen(): void {
        this.toggleAutoListen.emit();
    }

    protected onToggleWord(): void {
        this.toggleWord.emit();
    }

    protected onPlayAudio(): void {
        this.playAudio.emit();
    }

    protected onStartListening(): void {
        this.startListening.emit();
    }
}
