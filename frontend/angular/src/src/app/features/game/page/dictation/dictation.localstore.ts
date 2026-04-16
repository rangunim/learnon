import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Chapter, WordPair } from '../../../chapter/model/chapter.model';
import { GameStore } from '../../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpeechService } from '../../../../core/services/speech.service';

export interface DictationRootState {
    isLoading: boolean;
    currentStep: 'PLAY' | 'RESULTS';
    chapter: Chapter | null;
    words: WordPair[];
    isSwapped: boolean;
    highlightErrors: boolean;
}

export interface RootViewModel {
    state: DictationRootState;
    chapterId: string | null;
    totalCount: number;
}

export interface DictationPlayState {
    currentIndex: number;
    currentInput: string;
    isCorrect: boolean | null;
    showHint: boolean;
    errorIndex: number;
    showTranslation: boolean;
    wasHintUsed: boolean;
}

export interface PlayViewModel {
    state: DictationPlayState;
    currentWord: WordPair | null;
    targetText: string;
    progress: number;
    hintText: string;
    charViews: CharView[];
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
    isTranslationDisabled: boolean;
    isGiveUpDisabled: boolean;
    translationIcon: string;
    showTranslationBox: boolean;
    languageLabel: string;
    counterText: string;
}

export interface CharView {
    char: string;
    isCorrect: boolean;
    isError: boolean;
    isDefault: boolean;
}

export interface DictationResultState {
    score: number;
}

export interface ResultViewModel {
    state: DictationResultState;
    totalCount: number;
    scoreText: string;
    percentText: string;
    chapterId: string | null;
}


const initialRoot: DictationRootState = {
    chapter: null,
    words: [],
    isSwapped: false,
    isLoading: false,
    currentStep: 'PLAY',
    highlightErrors: false
};

const initialPlay: DictationPlayState = {
    currentIndex: 0,
    currentInput: '',
    isCorrect: null,
    showHint: false,
    errorIndex: -1,
    showTranslation: false,
    wasHintUsed: false,
};

const initialResult: DictationResultState = {
    score: 0
};

@Injectable()
export class DictationLocalStore {
    private readonly gamesStore = inject(GameStore);
    private readonly destroyRef = inject(DestroyRef);
    private readonly speechService = inject(SpeechService);

    private readonly _root = signal<DictationRootState>(initialRoot);
    private readonly _play = signal<DictationPlayState>(initialPlay);
    private readonly _result = signal<DictationResultState>(initialResult);

    public readonly rootViewModel = computed((): RootViewModel => {
        const root: DictationRootState = this._root();
        return <RootViewModel>{
            state: root,
            chapterId: root.chapter?.id ?? null,
            totalCount: root.words.length
        };
    });

    public readonly playViewModel = computed((): PlayViewModel => {
        const root: DictationRootState = this._root();
        const play: DictationPlayState = this._play();

        const words: WordPair[] = root.words;
        const totalCount: number = words.length;

        const currentWord: WordPair | null = words[play.currentIndex] || null;
        const targetText: string = currentWord ? (root.isSwapped ? currentWord.pl : currentWord.eng) : '';
        const hintText: string = currentWord ? (root.isSwapped ? currentWord.eng : currentWord.pl) : '';

        const isCorrect: boolean = play.isCorrect === true;

        const charStates: CharView[] = calculateCharStates(
            play.currentInput || '',
            targetText.toLowerCase(),
            play.errorIndex,
            root.highlightErrors
        );

        return <PlayViewModel>{
            state: play,
            currentWord: currentWord,
            targetText: targetText,
            progress: words.length > 0 ? (play.currentIndex / words.length) * 100 : 0,
            hintText: hintText,
            charViews: charStates,
            isPrevDisabled: play.currentIndex === 0,
            isNextDisabled: play.showHint && !isCorrect,
            isTranslationDisabled: play.showHint,
            isGiveUpDisabled: play.showHint,
            translationIcon: play.showTranslation ? 'pi pi-eye-slash' : 'pi pi-question-circle',
            showTranslationBox: play.showTranslation && !play.showHint,
            languageLabel: root.isSwapped ? root.chapter?.lang1 || 'Polski' : root.chapter?.lang2 || 'Angielski',
            counterText: `${play.currentIndex + 1} / ${totalCount}`
        };
    });

    public readonly resultViewModel = computed((): ResultViewModel => {
        const root: DictationRootState = this._root();
        const result: DictationResultState = this._result();
        const totalCount: number = root.words.length;
        const score: number = result.score;

        return <ResultViewModel>{
            state: result,
            totalCount: totalCount,
            scoreText: `${score} / ${totalCount}`,
            percentText: totalCount > 0 ? `${Math.round((score / totalCount) * 100)}%` : '0%',
            chapterId: root.chapter?.id ?? null
        };
    });

    public handleLoadGame(id: string): void {
        this._root.update(r => ({ ...r, isLoading: true }));

        this.gamesStore.loadGameData(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: chapter => {
                const words = [...chapter.words].sort(() => Math.random() - 0.5);
                this._root.update(r => ({
                    ...r,
                    chapter: chapter,
                    words: words,
                    isLoading: false,
                    currentStep: 'PLAY'
                }));
            },
            error: () => this._root.update(r => ({ ...r, isLoading: false }))
        });
    }

    public checkAnswer(answer: string): void {
        const root: DictationRootState = this._root();
        const play: DictationPlayState = this._play();
        const currentWord: WordPair = root.words[play.currentIndex];
        const targetText: string = currentWord ? (root.isSwapped ? currentWord.pl : currentWord.eng) : '';
        const target: string = targetText.toLowerCase().trim();
        const user: string = answer.toLowerCase().trim();
        const isCorrect: boolean = target === user;

        if (isCorrect && play.isCorrect !== true) {
            const hintPenaltyUsed = play.wasHintUsed || play.showHint || play.showTranslation || root.highlightErrors;
            this._result.update(r => ({ score: r.score + (hintPenaltyUsed ? 0.5 : 1) }));
        }

        this._play.update(p => ({
            ...p,
            isCorrect,
            errorIndex: isCorrect ? -1 : p.errorIndex
        }));
    }

    public playAudio(): void {
        const root = this._root();
        const play = this._play();
        const currentWord = root.words[play.currentIndex];
        if (currentWord) {
            const targetText = root.isSwapped ? currentWord.pl : currentWord.eng;
            const targetLangCode = root.isSwapped ? 'pl-PL' : 'en-US';
            this.speechService.speak(targetText, targetLangCode);
        }
    }

    public validateInput(val: string): void {
        const root = this._root();
        const play = this._play();
        const currentWord = root.words[play.currentIndex];
        const target = currentWord ? (root.isSwapped ? currentWord.pl : currentWord.eng).trim() : '';
        const firstError = findFirstErrorIndex(val, target);

        this._play.update(p => ({
            ...p,
            errorIndex: firstError,
            currentInput: val
        }));

        if (target && val.trim().toLowerCase() === target.toLowerCase()) {
            this.checkAnswer(val);
        }
    }

    public toggleMode(): void {
        this._root.update(r => ({ ...r, isSwapped: !r.isSwapped }));
        this.resetGame();
    }

    public setShowHint(showHint: boolean): void {
        this._play.update(p => ({
            ...p,
            showHint,
            errorIndex: -1,
            wasHintUsed: p.wasHintUsed || showHint
        }));
    }

    public giveUp(): void {
        this._play.update(p => ({
            ...p,
            showHint: true,
            errorIndex: -1,
            currentInput: '',
            wasHintUsed: true
        }));
    }

    public toggleTranslation(): void {
        this._play.update(p => {
            const nextShow = !p.showTranslation;
            return {
                ...p,
                showTranslation: nextShow,
                wasHintUsed: p.wasHintUsed || nextShow
            };
        });
    }

    public toggleHighlight(): void {
        this._root.update(root => ({
            ...root,
            highlightErrors: !root.highlightErrors
        }));
    }

    public nextWord(): void {
        const p = this._play();
        const r = this._root();
        const nextIndex = p.currentIndex + 1;

        const commonReset = {
            isCorrect: null,
            showHint: false,
            errorIndex: -1,
            showTranslation: false,
            currentInput: '',
            wasHintUsed: false
        };

        if (nextIndex >= r.words.length) {
            this._root.update(root => ({ ...root, currentStep: 'RESULTS' }));
            this._play.update(play => ({ ...play, ...commonReset }));
        } else {
            this._play.update(play => ({ ...play, ...commonReset, currentIndex: nextIndex }));
        }
    }

    public nextStep(): void {
        const play = this._play();
        const isNextDisabled = play.showHint && play.isCorrect !== true;
        if (isNextDisabled) return;

        if (this._root().currentStep === 'PLAY') {
            this.nextWord();
        }
    }

    public prevStep(): void {
        if (this._root().currentStep === 'PLAY') {
            this._play.update(p => {
                if (p.currentIndex <= 0) {
                    return p;
                }

                return {
                    ...p,
                    currentIndex: p.currentIndex - 1,
                    isCorrect: null,
                    showHint: false,
                    errorIndex: -1,
                    showTranslation: false,
                    currentInput: '',
                    wasHintUsed: false
                };
            });
        }
    }

    public resetGame(): void {
        this._root.update(root => {
            const shuffled = [...(root.chapter?.words || [])].sort(() => Math.random() - 0.5);
            return { ...root, words: shuffled, currentStep: 'PLAY' };
        });
        this._play.set(initialPlay);
        this._result.set(initialResult);
    }
}

function calculateCharStates(userValue: string, targetValue: string, errorIndex: number, highlightErrors: boolean): CharView[] {
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
