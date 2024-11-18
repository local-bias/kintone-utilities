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

  private api = async <T>(params: { endpoint: string; method: 'GET' | 'POST'; body?: any }) => {
    const { endpoint, method, body } = params;

    if (this.#debug) console.log('📤 api request', params);

    const [responseBody, responseCode, responseHeader] = await kintone.proxy(
      endpoint,
      method,
      {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body
    );
    if (this.#debug) console.log('📥 api response', { responseBody, responseCode, responseHeader });

    return { responseBody, responseCode, responseHeader };
  };

  public fetchChatCompletion = async (
    params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
  ) => {
    if (this.#debug) console.group('🧠 OPENAI API Call');

    const { responseBody, responseCode } = await this.api({
      endpoint: OpenAIClient.ENDPOINT_CHAT,
      method: 'POST',
      body: params,
    });

    const chatCompletion: OpenAI.Chat.ChatCompletion = JSON.parse(responseBody);

    if (responseCode !== 200) {
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

    const { responseBody, responseCode } = await this.api({
      endpoint: OpenAIClient.ENDPOINT_IMAGE_GENERATION,
      method: 'POST',
      body: params,
    });

    const imageGeneration: OpenAI.ImagesResponse = JSON.parse(responseBody);

    if (responseCode !== 200) {
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
