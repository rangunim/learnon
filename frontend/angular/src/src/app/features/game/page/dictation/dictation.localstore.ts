import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpeechService } from '../../../../core/services/speech.service';

export interface DictationState {
    chapterId: string;
    chapter: Chapter | null;
    isLoading: boolean;
    currentIndex: number;
    words: WordPair[];
    score: number;
    isCorrect: boolean | null;
    showHint: boolean;
    errorIndex: number;
    isSwapped: boolean;
    showTranslation: boolean;
    currentInput: string;
    currentStep: 'PLAY' | 'RESULTS';
    highlightErrors: boolean;
    wasHintUsed: boolean;
}

export interface CharState {
    char: string;
    isCorrect: boolean;
    isError: boolean;
    isDefault: boolean;
}

export interface DictationViewModel {
    state: DictationState;
    totalCount: number;
    currentWord: WordPair | null;
    targetText: string;
    targetLangCode: string;
    lang1: string;
    lang2: string;
    progress: number;
    hintText: string;
    charStates: CharState[];
    // UI Properties aggregated from components
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
    counterText: string;
    highlightSeverity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
    isTranslationDisabled: boolean;
    isGiveUpDisabled: boolean;
    translationIcon: string;
    isVisualCorrect: boolean;
    showSuccessOverlay: boolean;
    nextButtonClass: string;
    showTranslationBox: boolean;
    languageLabel: string;
    scoreText: string;
    percentText: string;
}

export const initialState: DictationState = {
    chapterId: '',
    chapter: null,
    isLoading: false,
    currentIndex: 0,
    words: [],
    score: 0,
    isCorrect: null,
    showHint: false,
    errorIndex: -1,
    isSwapped: false,
    showTranslation: false,
    currentInput: '',
    currentStep: 'PLAY',
    highlightErrors: false,
    wasHintUsed: false,
};

@Injectable()
export class DictationLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly speechService = inject(SpeechService);

    private readonly _state = signal<DictationState>(initialState);

    // Base State Selectors
    private readonly _baseInfo = computed(() => {
        const s = this._state();
        const words = s.words;
        const totalCount = words.length;
        const index = s.currentIndex;
        const score = s.score;

        return {
            totalCount,
            currentIndex: index,
            currentStep: s.currentStep,
            progress: totalCount > 0 ? (index / totalCount) * 100 : 0,
            counterText: `${index + 1} / ${totalCount}`,
            scoreText: `${score} / ${totalCount}`,
            percentText: totalCount > 0 ? `${Math.round((score / totalCount) * 100)}%` : '0%'
        };
    });

    private readonly _wordContext = computed(() => {
        const s = this._state();
        const { currentIndex, totalCount } = this._baseInfo();
        const currentWord = s.words[currentIndex] || null;

        const isSwapped = s.isSwapped;
        const targetText = currentWord ? (isSwapped ? currentWord.pl : currentWord.eng) : '';
        const hintText = currentWord ? (isSwapped ? currentWord.eng : currentWord.pl) : '';
        const lang1 = s.chapter?.lang1 || 'Polski';
        const lang2 = s.chapter?.lang2 || 'Angielski';

        return {
            currentWord,
            targetText,
            hintText,
            targetLangCode: isSwapped ? 'pl-PL' : 'en-US',
            lang1,
            lang2,
            languageLabel: isSwapped ? lang1 : lang2
        };
    });

    private readonly _inputStatus = computed(() => {
        const s = this._state();
        const { targetText } = this._wordContext();
        const userValue = s.currentInput || '';
        const isCorrect = s.isCorrect === true;

        const charStates: CharState[] = calculateCharStates(
            userValue,
            targetText.toLowerCase(),
            s.errorIndex,
            s.highlightErrors
        );

        return {
            charStates,
            isVisualCorrect: isCorrect && s.highlightErrors,
            showSuccessOverlay: isCorrect && s.highlightErrors
        };
    });

    private readonly _uiActions = computed(() => {
        const s = this._state();
        const { currentIndex, totalCount } = this._baseInfo();
        const isCorrect = s.isCorrect === true;
        const showHint = s.showHint;

        return {
            isPrevDisabled: currentIndex === 0,
            isNextDisabled: showHint && !isCorrect,
            highlightSeverity: (s.highlightErrors ? 'info' : 'secondary') as any,
            isTranslationDisabled: showHint,
            isGiveUpDisabled: showHint,
            translationIcon: s.showTranslation ? 'pi pi-eye-slash' : 'pi pi-question-circle',
            showTranslationBox: s.showTranslation && !showHint,
            nextButtonClass: isCorrect ? 'dict-animate-bounce' : 'animate-fade-in'
        };
    });

    public readonly viewModel = computed((): DictationViewModel => {
        return {
            state: this._state(),
            ...this._baseInfo(),
            ...this._wordContext(),
            ...this._inputStatus(),
            ...this._uiActions()
        };
    });

    // Methods
    public handleLoadGame(id: string): void {
        this._patch({ isLoading: true, chapterId: id });
        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: chapter => {
                const words = [...chapter.words].sort(() => Math.random() - 0.5);
                this._patch({ chapter, words, isLoading: false });
            },
            error: () => this._patch({ isLoading: false })
        });
    }

    public checkAnswer(answer: string): void {
        const vm = this.viewModel();
        const target = vm.targetText.toLowerCase().trim();
        const user = answer.toLowerCase().trim();
        const isCorrect = target === user;

        this._state.update(s => {
            let newScore = s.score;
            if (isCorrect && s.isCorrect !== true) {
                const hintPenaltyUsed = s.wasHintUsed || s.showHint || s.showTranslation || s.highlightErrors;
                newScore += hintPenaltyUsed ? 0.5 : 1;
            }
            return {
                ...s,
                isCorrect,
                errorIndex: isCorrect ? -1 : s.errorIndex,
                score: newScore,
            };
        });
    }

    public playAudio(): void {
        const vm = this.viewModel();
        if (vm.currentWord) {
            this.speechService.speak(vm.targetText, vm.targetLangCode);
        }
    }

    public validateInput(val: string): void {
        const target = this.viewModel().targetText.trim();
        const firstError = findFirstErrorIndex(val, target);
        this._patch({ errorIndex: firstError, currentInput: val });

        if (target && val.trim().toLowerCase() === target.toLowerCase()) {
            this.checkAnswer(val);
        }
    }

    public toggleMode(): void {
        this._patch({ isSwapped: !this._state().isSwapped });
        this.resetGame();
    }

    public setShowHint(showHint: boolean): void {
        this._patch({ showHint, errorIndex: -1, wasHintUsed: this._state().wasHintUsed || showHint });
    }

    public giveUp(): void {
        this._patch({ showHint: true, errorIndex: -1, currentInput: '', wasHintUsed: true });
    }

    public toggleTranslation(): void {
        const nextShow = !this._state().showTranslation;
        this._patch({ showTranslation: nextShow, wasHintUsed: this._state().wasHintUsed || nextShow });
    }

    public toggleHighlight(): void {
        this._patch({ highlightErrors: !this._state().highlightErrors });
    }

    public nextWord(): void {
        const s = this._state();
        const nextIndex = s.currentIndex + 1;

        const commonReset = {
            isCorrect: null,
            showHint: false,
            errorIndex: -1,
            showTranslation: false,
            currentInput: '',
            wasHintUsed: false
        };

        if (nextIndex >= s.words.length) {
            this._patch({ ...commonReset, currentStep: 'RESULTS' });
        } else {
            this._patch({ ...commonReset, currentIndex: nextIndex });
        }
    }

    public nextStep(): void {
        const vm = this.viewModel();
        if (vm.isNextDisabled) return;

        if (vm.state.currentStep === 'PLAY') {
            this.nextWord();
        }
    }

    public prevStep(): void {
        const s = this._state();
        if (s.currentStep === 'PLAY') {
            if (s.currentIndex > 0) {
                this._patch({
                    currentIndex: s.currentIndex - 1,
                    isCorrect: null,
                    showHint: false,
                    errorIndex: -1,
                    showTranslation: false,
                    currentInput: '',
                    wasHintUsed: false
                });
            }
        }
    }

    public resetGame(): void {
        const s = this._state();
        const shuffled = [...(s.chapter?.words || [])].sort(() => Math.random() - 0.5);
        this._patch({
            currentIndex: 0,
            score: 0,
            words: shuffled,
            isCorrect: null,
            showHint: false,
            errorIndex: -1,
            showTranslation: false,
            currentInput: '',
            wasHintUsed: false
        });
    }

    private _patch(patch: Partial<DictationState>): void {
        this._state.update(s => ({ ...s, ...patch }));
    }
}

function calculateCharStates(userValue: string, targetValue: string, errorIndex: number, highlightErrors: boolean): CharState[] {
    return userValue.split('').map((char, index) => {
        const isError = highlightErrors && index === errorIndex;
        const isCorrect = highlightErrors && (errorIndex === -1 || index < errorIndex) && index < targetValue.length && char.toLowerCase() === targetValue[index];
        return {
            char,
            isCorrect,
            isError,
            isDefault: !isCorrect && !isError
        };
    });
}

function findFirstErrorIndex(val: string, target: string): number {
    if (!target) return -1;

    let firstError = -1;
    const minLen = Math.min(val.length, target.length);

    for (let i = 0; i < minLen; i++) {
        if (val[i].toLowerCase() !== target[i].toLowerCase()) {
            firstError = i;
            break;
        }
    }

    if (firstError === -1 && val.length > target.length) {
        firstError = target.length;
    }

    return firstError;
}
