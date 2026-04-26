import { test, expect, describe } from 'vitest';
import { FileShouldCondition } from 'archunit';
import { ProjectArchConfig, ArchGeneralRules } from '../architecture-config';


export function defineGeneralArchRules(config: ProjectArchConfig, featuresFiles: FileShouldCondition, appFiles: FileShouldCondition) {
    const { patterns, rules } = config;
    const general = rules.general as ArchGeneralRules;

    describe.runIf(rules.general)('General Architecture', () => {

        test.runIf(general.noSelectorsInPages)('Page components should not have selectors', async () => {
            const rule = featuresFiles
                .withName(patterns.page)
                .shouldNot()
                .adhereTo(
                    (file) => file.content.includes('selector:'),
                    'Page components should not have selectors'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.noRootLocalStore)('LocalStore services should not be provided in root', async () => {
            const rule = featuresFiles
                .withName(patterns.localstore)
                .shouldNot()
                .adhereTo(
                    (file) => /providedIn\s*:\s*['"]root['"]/.test(file.content),
                    "Local stores should not be provided in 'root'"
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.pageProvidesLocalStore)('Page components should provide their corresponding LocalStore', async () => {
            const rule = featuresFiles
                .withName(patterns.page)
                .should()
                .adhereTo(
                    (file) => {
                        const baseName = file.name.split('.')[0]
                            .split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                            .join('');

                        const expectedStore = `${baseName}LocalStore`;
                        const providersRegex = new RegExp(`providers\\s*:\\s*\\[[^\\]]*${expectedStore}[^\\]]*\\]`, 's');

                        return providersRegex.test(file.content);
                    },
                    'Every Page component must provide its corresponding LocalStore in the providers array'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.onPushDetection)('Components should use OnPush change detection', async () => {
            const rule = featuresFiles
                .withName(patterns.componentOrPage)
                .should()
                .adhereTo(
                    (file) => file.content.includes('ChangeDetectionStrategy.OnPush'),
                    'Components must use OnPush change detection'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.noCircularDependencies)('Project should not have circular dependencies', async () => {
            const rule = featuresFiles
                .should()
                .haveNoCycles();

            await expect(rule).toPassAsync();
        });

        test.runIf(general.privateStateSignals)('State signals should be private readonly and prefixed with underscore', async () => {
            const rule = featuresFiles
                .withName(patterns.logicFiles)
                .shouldNot()
                .adhereTo(
                    (file) => {
                        const hasPublicState = /public\s+readonly\s+_state/.test(file.content) ||
                            /(?<!private\s+readonly\s+)_state\s*=\s*(signal|writableSignal)/.test(file.content);
                        return hasPublicState;
                    },
                    'State signals (like _state) must be private readonly and prefixed with an underscore.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.publicViewModels)('ViewModels should be public readonly', async () => {
            const rule = featuresFiles
                .withName(patterns.logicFiles)
                .should()
                .adhereTo(
                    (file) => {
                        if (!file.content.includes('viewModel')) return true;
                        return /public\s+readonly\s+viewModel/.test(file.content) ||
                            (!/private\s+/.test(file.content) && /viewModel\s*=\s*computed/.test(file.content));
                    },
                    'viewModel properties should be public readonly to be accessible by components.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.privateFormProperties)('Form-related properties should be private readonly and prefixed with underscore', async () => {
            const rule = featuresFiles
                .withName(patterns.logicFiles)
                .shouldNot()
                .adhereTo(
                    (file) => {
                        const hasPublicForm = /public\s+readonly\s+_(form|formChanges|formStatus)/.test(file.content) ||
                            /(?<!private\s+readonly\s+)_(form|formChanges|formStatus)\s*[=:]/.test(file.content);
                        return hasPublicForm;
                    },
                    'Form properties (like _form, _formChanges, _formStatus) must be private readonly and prefixed with an underscore.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(general.onlyPagesInRoutes)('Only Page components should be used in routes', async () => {
            const rule = appFiles
                .withName(patterns.routes)
                .shouldNot()
                .adhereTo(
                    (file) => {
                        const imports = file.content.match(/import\s+{[^}]+}\s+from\s+['"]([^'"]+)['"]/g) || [];

                        for (const imp of imports) {
                            const pathMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
                            const componentNames = imp.match(/{([^}]+)}/);

                            if (pathMatch && componentNames) {
                                const path = pathMatch[1];
                                const components = componentNames[1].split(',').map(s => s.trim());

                                for (const component of components) {
                                    // If it's used as a component in a route, it must be from a .page file
                                    const componentUsageRegex = new RegExp(`component\\s*:\\s*${component}`, 's');
                                    if (componentUsageRegex.test(file.content)) {
                                        const isPage = path.endsWith('.page') || path.includes('.page.') || path.includes('.page/');
                                        if (!isPage) return true; // Violation!
                                    }
                                }
                            }
                        }
                        return false;
                    },
                    'Only Page components (from files ending in .page) should be used in routing files.'
                );

            await expect(rule).toPassAsync();
        });
    });

    test.runIf(general.reactiveFormBridge)('LocalStores with reactive forms should bridge them with toSignal', async () => {
        const rule = featuresFiles
            .withName(patterns.localstore)
            .should()
            .adhereTo(
                (file) => {
                    const ownReactiveForm = /FormGroup|FormBuilder|NonNullableFormBuilder|\.group\(/.test(file.content);
                    if (!ownReactiveForm) {
                        return true;
                    }
                    return file.content.includes('toSignal');
                },
                'LocalStores with reactive forms must bridge from changes with toSignal'
            );

        await expect(rule).toPassAsync();
    });
}
