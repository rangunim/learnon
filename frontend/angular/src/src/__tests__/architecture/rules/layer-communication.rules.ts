import { test, expect, describe } from 'vitest';
import { FileShouldCondition } from 'archunit';
import { ProjectArchConfig, ArchLayerRules } from '../architecture-config';


export function defineLayerCommunicationArchRules(config: ProjectArchConfig, featuresFiles: FileShouldCondition, coreFiles: FileShouldCondition) {
    const { paths, patterns, rules } = config;
    const layer = rules.layerCommunication as ArchLayerRules;

    describe.runIf(rules.layerCommunication)('Layer Communication', () => {

        test.runIf(layer.coreNoFeatures)('Core should not import from Features', async () => {
            const rule = coreFiles
                .shouldNot()
                .adhereTo(
                    (file) => file.content.includes('from \'../../features/') || file.content.includes('from \'../features/'),
                    'Core layer should not depend on Features layer'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(layer.componentsNoHttpClient)('Components should not import HttpClient directly', async () => {
            const rule = featuresFiles
                .withName(patterns.componentOrPage)
                .shouldNot()
                .adhereTo(
                    (file) => file.content.includes('@angular/common/http') && file.content.includes('HttpClient'),
                    'Components should not use HttpClient directly. Use Services or Stores instead.'
                );

            await expect(rule).toPassAsync();
        });

        test.runIf(layer.featureIsolation)('Features should be isolated and not import from other features', async () => {
            const features = ['chapter', 'game', 'auth', 'account', 'home'];

            for (const feature of features) {
                const others = features.filter(f => f !== feature);
                const otherPaths = others.map(f => `features/${f}/`);

                const rule = featuresFiles
                    .inFolder(`${paths.featuresRoot}/${feature}/**`)
                    .shouldNot()
                    .adhereTo(
                        (file) => otherPaths.some(path => file.content.includes(path) && !file.path.includes(path)),
                        `Feature ${feature} should not import from other features: ${others.join(', ')}`
                    );

                await expect(rule).toPassAsync();
            }
        });
    });
}
