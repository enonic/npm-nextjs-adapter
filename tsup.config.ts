import { defineConfig } from 'tsup';

export default defineConfig(() => {
    return {
        bundle: true,

        // Note that --dts does not resolve external (aka in node_modules) types
        // used in the .d.ts file, if that's somehow a requirement, try the
        // experimental --dts-resolve flag instead.
        dts: true,

        entry: [
            'src/index.ts',
            'src/client.ts',
            'src/baseMappings.ts',
            'src/views/**/*.tsx',
        ],
        keepNames: true,
        noExternal: [
            'unescape'
        ],
        outDir: '.',
        shims: true, // Not certain whether this is needed
        splitting: true,
        tsconfig: 'tsconfig.json',
    };
});