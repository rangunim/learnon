import { esbuildPluginIstanbul } from 'esbuild-plugin-istanbul';

/**
 * Custom esbuild plugin for Istanbul instrumentation.
 * This file is for @angular-builders/custom-esbuild.
 */
const plugin = esbuildPluginIstanbul({
    filter: /\.[cm]?ts$/,
    loader: 'ts',
    projectName: 'learnon',
});

// Fix: specify name if it's missing in the plugin object
if (!plugin.name) {
    plugin.name = 'istanbul';
}

export default plugin;
