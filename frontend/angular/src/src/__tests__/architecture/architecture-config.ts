import { defineGeneralArchRules } from "./rules/general.rules";
import { defineLayerCommunicationArchRules } from "./rules/layer-communication.rules";
import { defineLegacyGuardArchRules } from "./rules/legacy-guard.rules";
import { defineNamingArchRules } from "./rules/naming-convention.rules";
import { projectFiles } from "archunit";

export interface ArchPaths {
    features: string;
    core: string;
    app: string;
    featuresRoot: string;
}

export interface ArchPatterns {
    page: RegExp;
    localstore: RegExp;
    componentOrPage: RegExp;
    componentPageDirective: RegExp;
    componentPageDirectivePipe: RegExp;
    logicFiles: RegExp;
    models: RegExp;
    templates: RegExp;
    tsFiles: RegExp;
    routes: RegExp;
}

export interface ArchGeneralRules {
    noSelectorsInPages: boolean;
    noRootLocalStore: boolean;
    pageProvidesLocalStore: boolean;
    onPushDetection: boolean;
    noCircularDependencies: boolean;
    privateStateSignals: boolean;
    publicViewModels: boolean;
    privateFormProperties: boolean;
    onlyPagesInRoutes: boolean;
    reactiveFormBridge: boolean;
}

export interface ArchNamingRules {
    localStoreSuffix: boolean;
    modelDtoFolder: boolean;
}

export interface ArchLegacyRules {
    inputOutputFunctions: boolean;
    hostBindingListener: boolean;
    noStandaloneProperty: boolean;
    noStructuralDirectives: boolean;
    noNgClassAndNgStyle: boolean;
}

export interface ArchLayerRules {
    coreNoFeatures: boolean;
    componentsNoHttpClient: boolean;
    featureIsolation: boolean;
}

export interface ArchRulesSelection {
    general: boolean | ArchGeneralRules;
    naming: boolean | ArchNamingRules;
    legacyGuard: boolean | ArchLegacyRules;
    layerCommunication: boolean | ArchLayerRules;
}

export interface ArchRulesOverride {
    general?: boolean | Partial<ArchGeneralRules>;
    naming?: boolean | Partial<ArchNamingRules>;
    legacyGuard?: boolean | Partial<ArchLegacyRules>;
    layerCommunication?: boolean | Partial<ArchLayerRules>;
}

export interface ProjectArchConfig {
    paths: ArchPaths;
    patterns: ArchPatterns;
    rules: ArchRulesSelection;
}

export class ArchitectureConfigBuilder {
    private config: ProjectArchConfig = {
        paths: <ArchPaths>{
            features: 'src/app/features/**',
            core: 'src/app/core/**',
            app: 'src/app/**',
            featuresRoot: 'src/app/features'
        },
        patterns: <ArchPatterns>{
            page: /.*\.page\.ts$/,
            localstore: /.*\.localstore\.ts$/,
            componentOrPage: /.*\.(component|page)\.ts$/,
            componentPageDirective: /.*\.(component|page|directive)\.ts$/,
            componentPageDirectivePipe: /.*\.(component|page|directive|pipe)\.ts$/,
            logicFiles: /.*\.(store|localstore)\.ts$/,
            models: /.*\.(model|dto)\.ts$/,
            templates: /.*\.html$/,
            tsFiles: /.*\.ts$/,
            routes: /.*\.routes\.ts$/
        },
        rules: <ArchRulesSelection>{
            general: true,
            naming: true,
            legacyGuard: true,
            layerCommunication: true
        }
    };

    public getConfig(): ProjectArchConfig {
        return this.config;
    }

    public updateConfig(overrides: Partial<ProjectArchConfig>): ArchitectureConfigBuilder {
        this.config = { ...this.config, ...overrides };
        this.normalizeRules();
        return this;
    }

    public overrideRules(overrides: ArchRulesOverride): ArchitectureConfigBuilder {
        this.config.rules = { ...this.config.rules, ...overrides } as ArchRulesSelection;
        this.normalizeRules();
        return this;
    }

    public runTests(): void {
        this.normalizeRules();

        const allFiles = projectFiles().inFolder(this.config.paths.app);
        const featuresFiles = allFiles.inFolder(this.config.paths.features);
        const coreFiles = allFiles.inFolder(this.config.paths.core);

        defineGeneralArchRules(this.config, featuresFiles, allFiles);
        defineLayerCommunicationArchRules(this.config, featuresFiles, coreFiles);
        defineLegacyGuardArchRules(this.config, featuresFiles);
        defineNamingArchRules(this.config, featuresFiles);
    }

    private normalizeRules(): void {
        const defaults = {
            general: <ArchGeneralRules>{
                noSelectorsInPages: true,
                noRootLocalStore: true,
                pageProvidesLocalStore: true,
                onPushDetection: true,
                noCircularDependencies: true,
                privateStateSignals: true,
                publicViewModels: true,
                privateFormProperties: true,
                onlyPagesInRoutes: true,
                reactiveFormBridge: true
            },
            naming: <ArchNamingRules>{
                localStoreSuffix: true,
                modelDtoFolder: true
            },
            legacyGuard: <ArchLegacyRules>{
                inputOutputFunctions: true,
                hostBindingListener: true,
                noStandaloneProperty: true,
                noStructuralDirectives: true,
                noNgClassAndNgStyle: true
            },
            layerCommunication: <ArchLayerRules>{
                coreNoFeatures: true,
                componentsNoHttpClient: true,
                featureIsolation: true
            }
        };

        const { rules } = this.config as { rules: ArchRulesSelection };

        if (rules.general === true) rules.general = defaults.general;
        else if (typeof rules.general === 'object') rules.general = { ...defaults.general, ...rules.general };

        if (rules.naming === true) rules.naming = defaults.naming;
        else if (typeof rules.naming === 'object') rules.naming = { ...defaults.naming, ...rules.naming };

        if (rules.legacyGuard === true) rules.legacyGuard = defaults.legacyGuard;
        else if (typeof rules.legacyGuard === 'object') rules.legacyGuard = { ...defaults.legacyGuard, ...rules.legacyGuard };

        if (rules.layerCommunication === true) rules.layerCommunication = defaults.layerCommunication;
        else if (typeof rules.layerCommunication === 'object') rules.layerCommunication = { ...defaults.layerCommunication, ...rules.layerCommunication };
    }
}
