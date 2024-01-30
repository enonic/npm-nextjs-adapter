// import GlobalsPlugin from 'esbuild-plugin-globals';
import { defineConfig } from 'tsup';

export default defineConfig([{
    bundle: true,

    // Note that --dts does not resolve external (aka in node_modules) types
    // used in the .d.ts file, if that's somehow a requirement, try the
    // experimental --dts-resolve flag instead.
    dts: true,

    entry: [
        'src/index.ts',
        'src/baseMappings.ts',
        'src/views/**/*.tsx',
    ],
    esbuildOptions(options, context) {
        options.chunkNames = '_chunks_server/[name]-[hash]';
    },
    // esbuildPlugins: [
    //     GlobalsPlugin({
    //         react: 'React',
    //         'react-dom': 'ReactDOM',
    //     }),
    // ],
    keepNames: true,
    noExternal: [
    //     '@formatjs/intl-localematcher',
    //     'html-react-parser',
    //     'negotiator',
    //     // 'next', // Causes: Error: Invariant: headers() expects to have requestAsyncStorage, none available.
    //     'react',
    //     'react-dom',
        'unescape',
    ],
    outDir: '.',
    platform: 'node',
    // shims: true, // Not certain whether this is needed
    sourcemap: true,
    splitting: true,
    // treeshake: true,
    tsconfig: 'tsconfig.json',
},{
    bundle: true,

    // Note that --dts does not resolve external (aka in node_modules) types
    // used in the .d.ts file, if that's somehow a requirement, try the
    // experimental --dts-resolve flag instead.
    dts: true,

    entry: [
        'src/client.ts',
    ],
    esbuildOptions(options, context) {
        options.banner = {
            js: `'use client';`
        };
        options.chunkNames = '_chunks_client/[name]-[hash]';
    },
    // Causes: ReferenceError: React is not defined
    // esbuildPlugins: [
    //     GlobalsPlugin({
    //         react: 'React',
    //         'react-dom': 'ReactDOM',
    //     }),
    // ],
    keepNames: true,
    noExternal: [
        '@formatjs/intl-localematcher',
        'html-react-parser',
        'negotiator',
        // 'next', // Causes: Error: Invariant: headers() expects to have requestAsyncStorage, none available.

        // WARNING: For GlobalsPlugin to work react and react-dom MUST be listed
        // here (if react under dependencies or peerDependencies)
        'react',
        'react-dom',

        'unescape',
    ],
    outDir: '.',
    platform: 'browser',
    // shims: true, // Not certain whether this is needed
    sourcemap: true,
    // splitting: true,
    // treeshake: true,
    tsconfig: 'tsconfig.json',
}]);