import { ArchGeneralRules, ArchitectureConfigBuilder, ArchRulesOverride } from './architecture-config';

//new ArchitectureConfigBuilder().runTests();

new ArchitectureConfigBuilder()
    .overrideRules(<ArchRulesOverride>{
        general: <Partial<ArchGeneralRules>>{ pageProvidesLocalStore: false } // landing-page does not provide localstore
    })
    .runTests();
