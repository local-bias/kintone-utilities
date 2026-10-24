import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

const heavyUiDependencyPattern =
  /node_modules\/(?:\.pnpm\/)?(?:@(mui|dnd-kit|radix-ui|emotion)(?:\+|\/)|lucide-react(?:@|\/))/;
const openAiDependencyPattern = /node_modules\/(?:\.pnpm\/)?openai(?:@|\/)/;
const zodDependencyPattern = /node_modules\/(?:\.pnpm\/)?zod(?:@|\/)/;

const cases = [
  {
    name: 'cloud ESM root',
    packageDirectory: 'packages/cloud',
    contents:
      "import { ChatworkClient } from '@konomi-app/kintone-utilities-cloud'; globalThis.__bundleCheck = ChatworkClient;",
    maxBytes: 55_000,
    forbiddenDependencies: [openAiDependencyPattern],
  },
  {
    name: 'cloud CJS chatwork subpath',
    packageDirectory: 'packages/cloud',
    contents:
      "const { ChatworkClient } = require('@konomi-app/kintone-utilities-cloud/chatwork'); globalThis.__bundleCheck = ChatworkClient;",
    maxBytes: 55_000,
    forbiddenDependencies: [openAiDependencyPattern],
  },
  {
    name: 'core ESM root',
    packageDirectory: 'packages/core',
    contents:
      "import { getYuruChara } from '@konomi-app/kintone-utilities'; globalThis.__bundleCheck = getYuruChara;",
    maxBytes: 8_000,
  },
  {
    name: 'core CJS subpath',
    packageDirectory: 'packages/core',
    contents:
      "const { getYuruChara } = require('@konomi-app/kintone-utilities/character-width-conversion'); globalThis.__bundleCheck = getYuruChara;",
    maxBytes: 8_000,
  },
  {
    name: 'jotai ESM root',
    packageDirectory: 'packages/jotai',
    contents:
      "import { useArray } from '@konomi-app/kintone-utilities-jotai'; globalThis.__bundleCheck = useArray;",
    maxBytes: 30_000,
    forbiddenDependencies: [heavyUiDependencyPattern],
  },
  {
    name: 'jotai CJS hook subpath',
    packageDirectory: 'packages/jotai',
    contents:
      "const { useArray } = require('@konomi-app/kintone-utilities-jotai/hooks/use-array'); globalThis.__bundleCheck = useArray;",
    maxBytes: 40_000,
    forbiddenDependencies: [heavyUiDependencyPattern],
  },
  {
    name: 'recoil ESM root',
    packageDirectory: 'packages/recoil',
    contents:
      "import { useArray } from '@konomi-app/kintone-utilities-recoil'; globalThis.__bundleCheck = useArray;",
    maxBytes: 250_000,
    forbiddenDependencies: [heavyUiDependencyPattern],
  },
  {
    name: 'recoil CJS hook subpath',
    packageDirectory: 'packages/recoil',
    contents:
      "const { useArray } = require('@konomi-app/kintone-utilities-recoil/hooks/use-array'); globalThis.__bundleCheck = useArray;",
    maxBytes: 250_000,
    forbiddenDependencies: [heavyUiDependencyPattern],
  },
  {
    name: 'schema generator ESM root',
    packageDirectory: 'packages/schema-generator',
    contents:
      "import { generateSchemaCode } from '@konomi-app/kintone-schema-generator'; globalThis.__bundleCheck = generateSchemaCode;",
    maxBytes: 370_000,
    forbiddenDependencies: [zodDependencyPattern],
  },
  {
    name: 'schema generator CJS subpath',
    packageDirectory: 'packages/schema-generator',
    contents:
      "const { generateSchemaCode } = require('@konomi-app/kintone-schema-generator/generator'); globalThis.__bundleCheck = generateSchemaCode;",
    maxBytes: 370_000,
    forbiddenDependencies: [zodDependencyPattern],
  },
  {
    name: 'ketch ESM root',
    packageDirectory: 'packages/ketch',
    contents:
      "import { createKetch } from '@konomi-app/ketch'; globalThis.__bundleCheck = createKetch;",
    maxBytes: 5_000,
  },
];

for (const testCase of cases) {
  const result = await build({
    stdin: {
      contents: testCase.contents,
      resolveDir: resolve(repositoryRoot, testCase.packageDirectory),
      sourcefile: `${testCase.name.replaceAll(' ', '-')}.js`,
    },
    bundle: true,
    external: testCase.external,
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
  const unexpectedDependencies = bundledInputs.filter((path) =>
    testCase.forbiddenDependencies?.some((pattern) => pattern.test(path)),
  );

  if (unexpectedDependencies.length > 0) {
    throw new Error(
      `${testCase.name} unexpectedly bundled heavy dependencies:\n${unexpectedDependencies.join('\n')}`,
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
