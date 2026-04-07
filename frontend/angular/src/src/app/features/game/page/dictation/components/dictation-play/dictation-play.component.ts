import { ChangeDetectionStrategy, Component, input, output, signal, effect, ElementRef, viewChild, untracked, computed } from '@angular/core';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { WordPair } from '../../../../../chapter/model/chapter.model';
import { DictationViewModel } from '../../dictation.localstore';

@Component({
    selector: 'app-dictation-play',
    imports: [Button, TooltipModule, ProgressBar],
    templateUrl: './dictation-play.component.html',
    styleUrl: './dictation-play.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictationPlayComponent {
    readonly viewModel = input.required<DictationViewModel>();

    readonly nextWord = output<void>();
    readonly toggleTranslation = output<void>();
    readonly giveUp = output<void>();
    readonly inputChange = output<string>();
    readonly enterPressed = output<void>();
    readonly playAudio = output<void>();

    protected readonly isFocused = signal(false);
    private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('dictInput');

    constructor() {
        effect(() => {
            const currentWord: WordPair | null = this.viewModel().currentWord;

            if (currentWord && this.viewModel().state.currentStep === 'PLAY') {
                untracked(() => {
                    setTimeout(() => this.inputEl()?.nativeElement.focus(), 300);
                });
            }
        });
    }

    protected handleInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.inputChange.emit(inputElement.value);
    }

    protected handleEnter(event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.enterPressed.emit();
    }

    protected focusInput(): void {
        this.inputEl()?.nativeElement.focus();
    }


    protected onGiveUp(): void {
        this.giveUp.emit();
    }

    protected next(): void {
        this.nextWord.emit();
    }

    protected onToggleTranslation(): void {
        this.toggleTranslation.emit();
    }

    protected onPlayAudio(): void {
        this.playAudio.emit();
    }
}
