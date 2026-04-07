import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SpeechService {
    // Speech Synthesis
    private synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;

    // Speech Recognition (prefixed for some browsers)
    private Recognition = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
    private recognition: any;

    isListening = signal(false);
    isSupported = signal(false);

    constructor() {
        if (this.Recognition) {
            this.isSupported.set(true);
            this.recognition = new this.Recognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
        }
    }

    speak(text: string, lang: string = 'en-US'): void {
        if (!this.synthesis) return;

        // Stop any current speaking
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        this.synthesis.speak(utterance);
    }

    listen(lang: string = 'en-US'): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.recognition) {
                reject('Speech Recognition nie jest wspierane w tej przeglądarce.');
                return;
            }

            this.recognition.lang = lang;

            this.recognition.onstart = () => {
                this.isListening.set(true);
            };

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                this.isListening.set(false);
                resolve(transcript);
            };

            this.recognition.onerror = (event: any) => {
                this.isListening.set(false);
                const errorMsg = this.translateError(event.error);
                reject(errorMsg);
            };

            this.recognition.onend = () => {
                this.isListening.set(false);
            };

            try {
                this.recognition.start();
            } catch (e) {
                this.isListening.set(false);
                reject('Nie udało się uruchomić mikrofonu.');
            }
        });
    }

    private translateError(error: string): string {
        switch (error) {
            case 'not-allowed':
                return 'Brak uprawnień do mikrofonu. Sprawdź ustawienia przeglądarki.';
            case 'no-speech':
                return 'Nie wykryto mowy. Spróbuj powtórzyć wyraźniej.';
            case 'network':
                return 'Błąd sieci. Rozpoznawanie mowy wymaga połączenia z internetem.';
            case 'aborted':
                return 'Rozpoznawanie mowy zostało przerwane.';
            default:
                return `Wystąpił błąd mikrofonu: ${error}`;
        }
    }

    stopListening(): void {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
