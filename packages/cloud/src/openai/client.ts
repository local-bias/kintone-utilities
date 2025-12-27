import { ketch } from '@konomi-app/ketch';
import OpenAI from 'openai';

export class OpenAIClient {
  readonly #apiKey: string;
  #debug: boolean;

  public static ENDPOINT_ROOT = 'https://api.openai.com';
  public static ENDPOINT_CHAT = `${OpenAIClient.ENDPOINT_ROOT}/v1/chat/completions`;
  public static ENDPOINT_IMAGE_GENERATION = `${OpenAIClient.ENDPOINT_ROOT}/v1/images/generations`;

  public constructor(props: { apiKey: string; debug?: boolean }) {
    const { apiKey, debug = false } = props;
    this.#apiKey = apiKey;
    this.#debug = debug;
  }

  private api = async (params: { endpoint: string; method: 'GET' | 'POST'; body?: any }) => {
    const { endpoint, method, body } = params;

    if (this.#debug) console.log('📤 api request', params);

    const response = await ketch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify(body ?? {}),
    });
    if (this.#debug) console.log('📥 api response', response);

    return response;
  };

  public fetchChatCompletion = async (
    params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
  ) => {
    if (this.#debug) console.group('🧠 OPENAI API Call');

    const response = await this.api({
      endpoint: OpenAIClient.ENDPOINT_CHAT,
      method: 'POST',
      body: params,
    });

    const chatCompletion: OpenAI.Chat.ChatCompletion = await response.json();

    if (response.status !== 200) {
      const errorResponse = chatCompletion as any;
      if (errorResponse?.error?.message) {
        throw new Error(errorResponse.error.message);
      }
      throw new Error(
        'APIの呼び出しに失敗しました。再度実行しても失敗する場合は、管理者にお問い合わせください。'
      );
    }

    if (this.#debug) console.log('💭 chat completion', { chatCompletion });

    if (this.#debug)
      console.log(`💰 This conversation consumed ${chatCompletion.usage?.total_tokens} tokens`);

    if (this.#debug) console.groupEnd();

    return chatCompletion;
  };

  public generateImage = async (params: OpenAI.ImageGenerateParams) => {
    if (this.#debug) console.group('🧠 OPENAI API Call');

    const response = await this.api({
      endpoint: OpenAIClient.ENDPOINT_IMAGE_GENERATION,
      method: 'POST',
      body: params,
    });

    const imageGeneration: OpenAI.ImagesResponse = await response.json();

    if (response.status !== 200) {
      const errorResponse = imageGeneration as any;
      if (errorResponse?.error?.message) {
        throw new Error(errorResponse.error.message);
      }
      throw new Error(
        'APIの呼び出しに失敗しました。再度実行しても失敗する場合は、管理者にお問い合わせください。'
      );
    }

    if (this.#debug) console.log('🖼 image generation', { imageGeneration });

    if (this.#debug) console.groupEnd();

    return imageGeneration;
  };
}
