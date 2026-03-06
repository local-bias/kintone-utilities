/**
 * Kintone Schema Generator CLI
 *
 * kintoneアプリのフィールド定義からZodスキーマを自動生成するCLIツール
 *
 * Usage:
 *   kintone-schema-generate <APP_ID> <OUTPUT_NAME> [OPTIONS]
 *
 * Examples:
 *   kintone-schema-generate 123 customers
 *   kintone-schema-generate 123 customers --full
 *   kintone-schema-generate 123 customers --output ./schemas
 *
 * Options:
 *   --full         フィールド定義に加え、ビュー、プロセス管理などの設定も生成
 *   --preview      未反映の設定（プレビュー）を取得
 *   --verbose, -v  詳細なログを出力
 *   --output, -o   出力先ディレクトリ（デフォルト: ./src/lib/kintone/schemas）
 *   --zod-import   Zodのimportパス（デフォルト: zod）
 *
 * Required Environment Variables:
 *   - KINTONE_BASE_URL
 *   - KINTONE_USERNAME
 *   - KINTONE_PASSWORD
 *   - KINTONE_BASIC_USERNAME (optional)
 *   - KINTONE_BASIC_PASSWORD (optional)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateSchema, type GenerateOptions } from './generator';

// =============================================================================
// Types
// =============================================================================

interface CLIOptions extends GenerateOptions {
  outputDir: string;
}

// =============================================================================
// CLI Implementation
// =============================================================================

function printUsage(): void {
  console.log(`
Usage: kintone-schema-generate <APP_ID> <OUTPUT_NAME> [OPTIONS]

Arguments:
  APP_ID       kintoneアプリのID
  OUTPUT_NAME  出力ファイル名（拡張子なし）

Options:
  --full         フィールド定義に加え、ビュー、プロセス管理などの設定も生成
  --preview      未反映の設定（プレビュー）を取得
  --verbose, -v  詳細なログを出力
  --output, -o   出力先ディレクトリ（デフォルト: ./src/lib/kintone/schemas）
  --zod-import   Zodのimportパス（デフォルト: zod）

Environment Variables:
  KINTONE_BASE_URL       kintoneのベースURL（例: https://xxx.cybozu.com）
  KINTONE_USERNAME       kintoneのユーザー名
  KINTONE_PASSWORD       kintoneのパスワード
  KINTONE_BASIC_USERNAME Basic認証のユーザー名（任意）
  KINTONE_BASIC_PASSWORD Basic認証のパスワード（任意）

Examples:
  kintone-schema-generate 123 customers
  kintone-schema-generate 123 customers --full
  kintone-schema-generate 123 customers --output ./schemas --zod-import zod/v4
`);
}

function parseArgs(args: string[]): {
  appId: string;
  outputName: string;
  options: CLIOptions;
} | null {
  const options: CLIOptions = {
    full: false,
    preview: false,
    verbose: false,
    outputDir: path.join(process.cwd(), 'src', 'lib', 'kintone', 'schemas'),
    zodImportPath: 'zod',
  };

  const positionalArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--full') {
      options.full = true;
    } else if (arg === '--preview') {
      options.preview = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--output' || arg === '-o') {
      const nextArg = args[++i];
      if (!nextArg) {
        console.error('Error: --output requires a directory path');
        return null;
      }
      options.outputDir = path.resolve(process.cwd(), nextArg);
    } else if (arg === '--zod-import') {
      const nextArg = args[++i];
      if (!nextArg) {
        console.error('Error: --zod-import requires an import path');
        return null;
      }
      options.zodImportPath = nextArg;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      positionalArgs.push(arg);
    } else {
      console.error(`Error: Unknown option: ${arg}`);
      return null;
    }
  }

  if (positionalArgs.length < 2) {
    return null;
  }

  return {
    appId: positionalArgs[0],
    outputName: positionalArgs[1],
    options,
  };
}

async function main(): Promise<void> {
  // dotenvがインストールされている場合は読み込む
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch {
    // dotenvがない場合は無視
  }

  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed) {
    printUsage();
    process.exit(1);
  }

  const { appId, outputName, options } = parsed;

  // 環境変数チェック
  const {
    KINTONE_BASE_URL: baseUrl,
    KINTONE_USERNAME: username,
    KINTONE_PASSWORD: password,
    KINTONE_BASIC_USERNAME: basicUsername,
    KINTONE_BASIC_PASSWORD: basicPassword,
  } = process.env;

  if (!baseUrl || !username || !password) {
    console.error('Error: Required environment variables are not set.');
    console.error('Please set: KINTONE_BASE_URL, KINTONE_USERNAME, KINTONE_PASSWORD');
    process.exit(1);
  }

  try {
    console.log(`Generating schema for app ${appId}...`);

    const result = await generateSchema(
      {
        baseUrl,
        username,
        password,
        basicUsername,
        basicPassword,
      },
      appId,
      outputName,
      options
    );

    // 出力ディレクトリ作成
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true });
    }

    // ファイル出力
    const outputPath = path.join(options.outputDir, `${outputName}.ts`);
    fs.writeFileSync(outputPath, result.code, 'utf-8');

    console.log(`\nSchema generated successfully!`);
    console.log(`Output: ${outputPath}`);
    console.log(`Schema name: ${result.schemaName}`);
    console.log(`Field count: ${result.fieldCount}`);
    console.log(`\nUsage example:`);
    console.log(
      `  import { ${result.schemaName}RecordSchema, type ${result.schemaName}Record } from "./${outputName}";`
    );

    if (options.full) {
      console.log(`\nAdditional exports:`);
      console.log(`  - ${result.schemaName.toUpperCase()}_APP_ID: アプリID`);
      console.log(`  - ${result.schemaName.toUpperCase()}_FIELDS: フィールド情報`);
      console.log(`  - ${result.schemaName}Query: クエリビルダーヘルパー`);
    }
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  }
}

main();
