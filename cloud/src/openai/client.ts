import OpenAI from 'openai';

export class OpenAIClient {
  readonly #apiKey: string;
  #debug: boolean;

  public static ENDPOINT_ROOT = 'https://api.openai.com';
  public static ENDPOINT_CHAT = `${OpenAIClient.ENDPOINT_ROOT}/v1/chat/completions`;

  public constructor(props: { apiKey: string; debug?: boolean }) {
    const { apiKey, debug = false } = props;
    this.#apiKey = apiKey;
    this.#debug = debug;
  }

  public fetchChatCompletion = async (
    params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming
  ) => {
    if (this.#debug) console.group('🧠 OPENAI API Call');

    if (this.#debug) console.log('params', params);

    const [responseBody, responseCode, responseHeader] = await kintone.proxy(
      OpenAIClient.ENDPOINT_CHAT,
      'POST',
      {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${this.#apiKey}`,
      },
      params
    );

    if (this.#debug) console.log('Response', { responseBody, responseCode, responseHeader });

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
}
