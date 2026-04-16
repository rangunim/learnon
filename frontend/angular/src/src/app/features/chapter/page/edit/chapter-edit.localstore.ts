import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { ChapterUpdateRequest } from '../../model/chapter.dto';
import { Chapter } from '../../model/chapter.model';
import { Router } from '@angular/router';
import { ChapterStore } from '../../chapter.store';
import { FormArray, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';


export interface ChapterEditFormData {
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    words: { pl: string; eng: string }[];
}

export interface ChapterEditState {
    chapterId: string | null;
    initialData: Chapter | null;
    isLoading: boolean;
    isSaving: boolean;
}

export interface ChapterEditViewModel {
    state: ChapterEditState;
    form: FormGroup;
    isValid: boolean;
    canSubmit: boolean;
    submitLabel: string;
}

@Injectable()
export class ChapterEditLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly router = inject(Router);
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _form: FormGroup = this.fb.group({
        name: this.fb.control('', Validators.required),
        description: this.fb.control(''),
        lang1: this.fb.control('', Validators.required),
        lang2: this.fb.control('', Validators.required),
        isPublic: this.fb.control(false),
        words: this.fb.array([])
    });

    private readonly _formChanges = toSignal(
        this._form.valueChanges,
        { initialValue: this._form.value }
    );

    private readonly _formStatus = toSignal(
        this._form.statusChanges,
        { initialValue: this._form.status }
    );

    private readonly _state = signal<ChapterEditState>({
        chapterId: null,
        initialData: null,
        isLoading: false,
        isSaving: false
    });

    public readonly viewModel = computed<ChapterEditViewModel>(() => {
        const s = this._state();
        const status = this._formStatus();
        this._formChanges(); // Wymusza odświeżenie widoku przy każdej zmianie wartości

        return {
            state: s,
            form: this._form,
            isValid: status === 'VALID',
            canSubmit: status === 'VALID' && !s.isSaving,
            submitLabel: s.isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'
        };
    });

    public get words(): FormArray {
        return this._form.get('words') as FormArray;
    }

    public loadChapter(id: string): void {
        const globalCache = this.chapterStore.state().chapters.find((c: Chapter) => c.id === id);

        this._state.update(s => ({
            ...s,
            isLoading: !globalCache,
            chapterId: id,
            initialData: globalCache || null
        }));

        this.chapterStore.loadChapter(id).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (chapter: Chapter) => {
                this.patchFormWithData(chapter);
                this._state.update(s => ({ ...s, initialData: chapter, isLoading: false }));
            },
            error: (err: unknown) => {
                console.error('Failed to load chapter for edit:', err);
                this._state.update(s => ({ ...s, isLoading: false, chapterId: null }));
                this.router.navigate(['/chapters']);
            }
        });
    }

    public updateChapter(): void {
        const id = this._state().chapterId;
        if (!id || this._form.invalid) return;

        const chapterData = this._form.getRawValue() as ChapterEditFormData;

        this._state.update(s => ({ ...s, isSaving: true }));

        this.chapterStore.updateChapter(id, chapterData as ChapterUpdateRequest).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this._state.update(s => ({ ...s, isSaving: false }));
                this.router.navigate(['/chapters', id]);
            },
            error: (err: unknown) => {
                console.error('Error updating chapter:', err);
                this._state.update(s => ({ ...s, isSaving: false }));;
            }
        });
    }

    public cancel(): void {
        const id = this._state().chapterId;
        if (id) {
            this.router.navigate(['/chapters', id]);
        } else {
            this.router.navigate(['/chapters']);
        }
    }

    private patchFormWithData(data: Chapter): void {
        this._form.patchValue({
            name: data.name,
            description: data.description,
            lang1: data.lang1 || 'Polski',
            lang2: data.lang2 || 'Angielski',
            isPublic: data.isPublic || false
        });

        this.words.clear();

        data.words.forEach((w: { pl: string; eng: string }) => {
            this.words.push(this.fb.group({
                pl: this.fb.control(w.pl, Validators.required),
                eng: this.fb.control(w.eng, Validators.required)
            }));
        });
    }

    public addWord(): void {
        this.words.push(this.fb.group({
            pl: this.fb.control('', Validators.required),
            eng: this.fb.control('', Validators.required)
        }));
    }

    public removeWord(index: number): void {
        this.words.removeAt(index);
    }
}
