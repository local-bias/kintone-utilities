import {
  KintoneClient,
  type KintoneClientConfig,
  type KintoneGetGeneralSettingsResponse,
  type KintoneGetProcessManagementResponse,
  type KintoneGetViewsResponse,
} from './client';
import { type GenerateOptions, type GenerateResult, generateSchemaCode } from './generator';

/**
 * kintone APIからスキーマを生成
 */
export async function generateSchema(
  clientConfig: KintoneClientConfig,
  appId: string,
  outputName: string,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  const client = new KintoneClient(clientConfig);

  if (options.verbose) {
    console.log(`Fetching form fields for app ${appId}...`);
  }

  const fields = await client.getFormFields(appId);

  if (options.verbose) {
    console.log(`Found ${Object.keys(fields).length} fields.`);
  }

  let processManagement: KintoneGetProcessManagementResponse | null = null;
  let views: KintoneGetViewsResponse | null = null;
  let generalSettings: KintoneGetGeneralSettingsResponse | null = null;

  if (options.full) {
    if (options.verbose) {
      console.log('Fetching additional app settings...');
    }

    try {
      processManagement = await client.getProcessManagement(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - Process management settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch process management settings:', error);
      }
    }

    try {
      views = await client.getViews(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - View settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch view settings:', error);
      }
    }

    try {
      generalSettings = await client.getGeneralSettings(appId, {
        preview: options.preview,
        lang: 'ja',
      });
      if (options.verbose) {
        console.log('  - General settings fetched');
      }
    } catch (error) {
      if (options.verbose) {
        console.warn('  - Could not fetch general settings:', error);
      }
    }
  }

  return generateSchemaCode(appId, outputName, fields, {
    ...options,
    processManagement,
    views,
    generalSettings,
  });
}
