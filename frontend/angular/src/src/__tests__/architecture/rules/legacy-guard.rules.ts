import { test, expect, describe } from 'vitest';
import { CheckOptions, FileConditionBuilder } from 'archunit';
import { ProjectArchConfig, ArchLegacyRules } from '../architecture-config';

export function defineLegacyGuardArchRules(config: ProjectArchConfig, featuresFiles: FileConditionBuilder) {
    const { patterns, rules } = config;
    const legacyGuard = rules.legacyGuard as ArchLegacyRules;

    describe.runIf(rules.legacyGuard)('Legacy Guard', () => {

        test.runIf(legacyGuard.inputOutputFunctions)('Use input() and output() functions instead of decorators', async () => {
            const rule = featuresFiles
                .withName(patterns.tsFiles)
                .shouldNot()
                .adhereTo(
                    (file) => (file.content.includes('@Input(') || file.content.trim().includes('@Input\n') || file.content.includes('@Output(')),
                    'Legacy @Input/@Output decorators are forbidden. Use input() and output() functions.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(legacyGuard.hostBindingListener)('Should not use @HostBinding or @HostListener', async () => {
            const rule = featuresFiles
                .withName(patterns.componentPageDirective)
                .shouldNot()
                .adhereTo(
                    (file) => file.content.includes('@HostBinding') || file.content.includes('@HostListener'),
                    'Use the host property in @Component/@Directive or host attribute instead of @HostBinding/@HostListener'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(legacyGuard.noStandaloneProperty)('Should not use standalone: true in decorators', async () => {
            const rule = featuresFiles
                .withName(patterns.componentPageDirectivePipe)
                .shouldNot()
                .adhereTo(
                    (file) => /standalone\s*:\s*true/.test(file.content),
                    'standalone: true is default in v20+, please remove it.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(legacyGuard.noStructuralDirectives)('HTML templates should not use legacy structural directives (*ngIf, *ngFor, *ngSwitch)', async () => {
            const rule = featuresFiles
                .withName(patterns.templates)
                .shouldNot()
                .adhereTo(
                    (file) => /\*ngIf|\*ngFor|\*ngSwitch/.test(file.content),
                    'Legacy structural directives (*ngIf, *ngFor, *ngSwitch) are forbidden. Use @if, @for, or @switch instead.'
                );

            await expect(rule).toPassAsync(<CheckOptions>{ allowEmptyTests: true });
        });

        test.runIf(legacyGuard.noNgClassAndNgStyle)('HTML templates should not use [ngClass] or [ngStyle]', async () => {
            const rule = featuresFiles
                .withName(patterns.templates)
                .shouldNot()
                .adhereTo(
                    (file) => /\[ngClass\]|\[ngStyle\]/.test(file.content),
                    '[ngClass] or [ngStyle] bindings are forbidden. Use standard conditional class and style bindings.'
                );

            await expect(rule).toPassAsync(<CheckOptions>{ allowEmptyTests: true });
        });
    });
}
