import { test, expect, describe } from 'vitest';
import { FileConditionBuilder } from 'archunit';
import { ProjectArchConfig, ArchNamingRules } from '../architecture-config';


export function defineNamingArchRules(config: ProjectArchConfig, featuresFiles: FileConditionBuilder) {
    const { patterns, rules } = config;
    const naming = rules.naming as ArchNamingRules;

    describe.runIf(rules.naming)('Naming Conventions', () => {

        test.runIf(naming.localStoreSuffix)('LocalStore classes must follow naming convention', async () => {
            const rule = featuresFiles
                .withName(patterns.localstore)
                .should()
                .adhereTo(
                    (file) => /class\s+\w+LocalStore/.test(file.content),
                    'Classes in .localstore.ts files must end with "LocalStore"'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(naming.modelDtoFolder)('Models and DTOs should be in model or dto folders with correct suffix', async () => {
            const rule = featuresFiles
                .withName(patterns.models)
                .should()
                .adhereTo(
                    (file) => file.path.includes('/model/') || file.path.includes('/dto/'),
                    'Model and DTO files must be located in a "model" or "dto" folder'
                );

            await expect(rule).toPassAsync();
        });
    });
}
