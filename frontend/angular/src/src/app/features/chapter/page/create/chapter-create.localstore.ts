import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ChapterCreateRequest } from '../../model/chapter.dto';
import { Router } from '@angular/router';
import { ChapterStore } from '../../chapter.store';
import { AuthStore } from '../../../../core/stores/auth.store';
import { FormArray, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ChapterCreateFormData {
    name: string;
    description: string;
    lang1: string;
    lang2: string;
    words: { pl: string; eng: string }[];
}

export interface ChapterCreateState {
    isSaving: boolean;
}

export interface ChapterCreateViewModel {
    state: ChapterCreateState;
    form: FormGroup;
    isValid: boolean;
    canSubmit: boolean;
    submitLabel: string;
}

@Injectable()
export class ChapterCreateLocalStore {
    private readonly chapterStore = inject(ChapterStore);
    private readonly router = inject(Router);
    private readonly authStore = inject(AuthStore);
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _form: FormGroup = this.fb.group({
        name: this.fb.control('', Validators.required),
        description: this.fb.control(''),
        lang1: this.fb.control('Polski', Validators.required),
        lang2: this.fb.control('Angielski', Validators.required),
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

    private readonly _state = signal<ChapterCreateState>({
        isSaving: false
    });

    public readonly viewModel = computed<ChapterCreateViewModel>(() => {
        const s = this._state();
        const status = this._formStatus();
        this._formChanges(); // Wymusza odświeżenie widoku przy każdej zmianie wartości

        return {
            state: s,
            form: this._form,
            isValid: status === 'VALID',
            canSubmit: status === 'VALID' && !s.isSaving,
            submitLabel: s.isSaving ? 'Zapisywanie...' : 'Zapisz rozdział'
        };
    });


    public get words(): FormArray {
        return this._form.get('words') as FormArray;
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

    public cancel(): void {
        this.router.navigate(['/chapters']);
    }

    public saveChapter(): void {
        const user = this.authStore.user();
        if (!user || this._form.invalid) return;

        const chapterData = this._form.getRawValue() as ChapterCreateFormData;

        const fullData: ChapterCreateRequest = {
            ...chapterData,
            userId: user.id,
            isPublic: false,
            originalAuthor: `${user.firstName} ${user.lastName}`.trim()
        };

        this._state.update(s => ({ ...s, isSaving: true }));

        this.chapterStore.createChapter(fullData).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this._state.update(s => ({ ...s, isSaving: false }));
                this.router.navigate(['/chapters']);
            },
            error: (err: unknown) => {
                console.error('Error saving new chapter:', err);
                this._state.update(s => ({ ...s, isSaving: false }));
            }
        });
    }
}
