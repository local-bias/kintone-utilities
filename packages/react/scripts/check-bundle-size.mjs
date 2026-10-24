import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import ts from 'typescript';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const consumerRoot = resolve(packageRoot, '../..');
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
const require = createRequire(import.meta.url);

const heavyUiDependencyPattern =
  /node_modules\/(?:\.pnpm\/)?(?:@(mui|tiptap|dnd-kit|radix-ui)(?:\+|\/)|lucide-react(?:@|\/))/;
const emotionDependencyPattern = /node_modules\/(?:\.pnpm\/)?@emotion(?:\+|\/)/;

const publicSubpaths = [
  '',
  '/lib',
  '/event-listener',
  '/component-manager',
  '/theme',
  '/components',
  '/components/embeddable-input',
  '/components/field-condition-input',
  '/components/field-condition-input/actions',
  '/components/field-condition-input/types',
  '/plugin',
  '/plugin/banner',
  '/plugin/content',
  '/plugin/footer',
  '/plugin/footer/root',
  '/plugin/layout',
  '/plugin/sidebar',
  '/plugin/sidebar/root',
  '/plugin/ui',
  '/plugin/ui/form-description',
  '/plugin/ui/form-section',
  '/plugin/ui/form-title',
  '/plugin-config',
  '/plugin-config/context',
  '/plugin-config/hooks',
  '/plugin-config/render',
  '/plugin-config/notification',
].map((subpath) => `@konomi-app/kintone-utilities-react${subpath}`);

const cases = [
  {
    name: 'ESM root embed',
    contents: "import { embed } from './packages/react/dist/index.js'; console.log(embed);",
    maxBytes: 250_000,
  },
  {
    name: 'CJS lib embed',
    contents: "const { embed } = require('./packages/react/dist/lib.cjs'); console.log(embed);",
    maxBytes: 250_000,
  },
  {
    name: 'field condition actions',
    contents:
      "import { buildConditionQuery } from './packages/react/dist/components/field-condition-input/actions.js'; console.log(buildConditionQuery);",
    maxBytes: 250_000,
  },
  {
    name: 'plugin config render',
    contents:
      "import { renderPluginConfig } from './packages/react/dist/plugin-config/render.js'; console.log(renderPluginConfig);",
    maxBytes: 250_000,
  },
  {
    name: 'CJS plugin footer root',
    contents:
      "const { PluginFooter } = require('./packages/react/dist/plugin/footer/root.cjs'); console.log(PluginFooter);",
    maxBytes: 250_000,
    usesEmotion: true,
  },
  {
    name: 'CJS plugin form title',
    contents:
      "const { PluginFormTitle } = require('./packages/react/dist/plugin/ui/form-title.cjs'); console.log(PluginFormTitle);",
    maxBytes: 250_000,
    usesEmotion: true,
  },
  {
    name: 'CJS plugin sidebar root',
    contents:
      "const { PluginSidebar } = require('./packages/react/dist/plugin/sidebar/root.cjs'); console.log(PluginSidebar);",
    maxBytes: 250_000,
    usesEmotion: true,
  },
];

for (const [subpath, conditions] of Object.entries(packageJson.exports)) {
  if (subpath.includes('*')) {
    continue;
  }

  for (const condition of ['import', 'require']) {
    for (const target of Object.values(conditions[condition])) {
      if (!existsSync(resolve(packageRoot, target))) {
        throw new Error(`Missing package export target: ${subpath} (${condition}) -> ${target}`);
      }
    }
  }
}

for (const specifier of publicSubpaths) {
  const esmPath = fileURLToPath(import.meta.resolve(specifier));
  const cjsPath = require.resolve(specifier);
  const typeResolution = ts.resolveModuleName(
    specifier,
    resolve(packageRoot, 'scripts/type-consumer.ts'),
    {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
    ts.sys,
  ).resolvedModule;

  if (!existsSync(esmPath) || !existsSync(cjsPath) || !typeResolution?.resolvedFileName) {
    throw new Error(`Failed to resolve package export: ${specifier}`);
  }
}

for (const testCase of cases) {
  const result = await build({
    stdin: {
      contents: testCase.contents,
      resolveDir: consumerRoot,
      sourcefile: `${testCase.name.replaceAll(' ', '-')}.js`,
    },
    bundle: true,
    format: 'iife',
    logLevel: 'error',
    metafile: true,
    minify: true,
    platform: 'browser',
    write: false,
  });

  const output = result.outputFiles[0].contents;
  const bundledInputs = Object.values(result.metafile.outputs).flatMap((metadata) =>
    Object.entries(metadata.inputs)
      .filter(([, input]) => input.bytesInOutput > 0)
      .map(([path]) => path),
  );
  const unexpectedDependencies = bundledInputs.filter(
    (path) =>
      heavyUiDependencyPattern.test(path) ||
      (!testCase.usesEmotion && emotionDependencyPattern.test(path)),
  );

  if (unexpectedDependencies.length > 0) {
    throw new Error(
      `${testCase.name} unexpectedly bundled UI dependencies:\n${unexpectedDependencies.join('\n')}`,
    );
  }

  if (output.byteLength > testCase.maxBytes) {
    throw new Error(
      `${testCase.name} is ${output.byteLength} bytes (limit: ${testCase.maxBytes} bytes)`,
    );
  }

  console.log(
    `${testCase.name}: ${output.byteLength} bytes (${gzipSync(output).byteLength} bytes gzip)`,
  );
}
