import { getHeaderSpace } from '@lb-ribbit/kintone-xapp';
import type { kintoneAPI } from './types/api';
import { detectGuestSpaceId, withMobileEvents } from './utilities';

type ErrorHandler = (error: any, props: { event: kintoneAPI.js.Event }) => kintoneAPI.js.Event;

type ConstructorProps = Partial<{
  errorHandler: ErrorHandler;
  pluginId: string;
  logDisabled: boolean;
  logPrefix: string;
}>;

type CallbackOption = { pluginId?: string; guestSpaceId: string | null };

export class KintoneEventManager {
  readonly #uid: string = Math.random().toString(36).slice(2);
  readonly #pluginId?: string;
  readonly #commonErrorHandler: ErrorHandler;
  readonly #guestSpaceId: string | null;
  #logDisabled: boolean;
  #logPrefix: string;

  /**
   * 複数の処理を、各イベントに登録することができます
   */
  public constructor(props?: ConstructorProps) {
    const {
      errorHandler = (error: any) => {
        throw error;
      },
      pluginId,
      logDisabled = false,
      logPrefix = '',
    } = props ?? {};

    const guestSpaceId = detectGuestSpaceId();

    this.#commonErrorHandler = errorHandler;
    this.#pluginId = pluginId;
    this.#guestSpaceId = guestSpaceId;
    this.#logDisabled = logDisabled;
    this.#logPrefix = logPrefix;
  }

  /**
   * **この関数は`kintone.events.on`の代替関数です. 引数に互換性があります.**
   *
   * デスクトップ版のイベントを指定することで自動的に対応するモバイル版のイベントが登録されます.
   * また、インスタンス作成時に指定したエラーハンドラが、コールバック関数のエラー発生時に実行されます
   * @param events
   * @param callback
   */
  public add = <T = kintoneAPI.RecordData>(
    events: kintoneAPI.js.EventType[],
    callback: (
      event: kintoneAPI.js.Event<T>,
      options: CallbackOption
    ) => kintoneAPI.js.Event<T> | Promise<kintoneAPI.js.Event<T>>
  ) => {
    kintone.events.on(withMobileEvents(events), async (event) => {
      try {
        this.initialize(event);
        return await callback(event, {
          pluginId: this.#pluginId,
          guestSpaceId: this.#guestSpaceId,
        });
      } catch (error) {
        return await this.#commonErrorHandler(error, { event });
      } finally {
        this.tarminate();
      }
    });
  };

  /**
   * Changeイベントを登録します
   *
   * ChangeイベントはPromiseオブジェクトを返却することができません
   * @param events
   * @param callback
   */
  public addChangeEvents = <T = kintoneAPI.RecordData>(
    events: string[],
    callback: (event: kintoneAPI.js.Event<T>, options: CallbackOption) => kintoneAPI.js.Event<T>
  ) => {
    kintone.events.on(withMobileEvents(events), (event) => {
      try {
        this.initialize(event);
        return callback(event, { pluginId: this.#pluginId, guestSpaceId: this.#guestSpaceId });
      } catch (error) {
        return this.#commonErrorHandler(error, { event });
      } finally {
        this.tarminate();
      }
    });
  };

  public addHeaderButton(params: {
    id: string;
    label: string;
    color?: 'default' | 'blue' | 'red' | 'yellow';
    isButtonHidden?: (event: kintoneAPI.js.Event) => boolean | Promise<boolean>;
    onClick: () => void | Promise<void>;
    events: kintoneAPI.js.EventType[];
  }) {
    const { id, label, color = 'default', onClick, isButtonHidden, events } = params;

    this.addButtonStyle();

    this.add(events, async (event) => {
      if (isButtonHidden && (await isButtonHidden(event))) {
        return event;
      }

      if (document.getElementById(id)) {
        return event;
      }
      const headerSpace = getHeaderSpace(event.type);
      if (!headerSpace) {
        throw new Error(
          'ヘッダーにボタンを追加することができませんでした。ヘッダーが見つかりませんでした。'
        );
      }

      const root = document.createElement('button');
      root.id = id;
      root.textContent = label;
      root.className = 'rkemb';
      root.dataset.color = color;
      root.addEventListener('click', onClick);
      headerSpace.append(root);

      return event;
    });
  }

  private addButtonStyle = () => {
    if (document.querySelector('style[data-rkem]')) {
      return;
    }

    const style = document.createElement('style');
    style.dataset.rkem = '';
    document.head.append(style);
    style.textContent = `
.rkemb {
  font-size: 15px;
  font-family: Yu Gothic Meduim, "游ゴシック Medium", "游ゴシック体", YuGothic, "游ゴシック", "メイリオ", sans-serif;
  display: inline-flex;
  margin: 0 4px;
  padding: 0 16px;
  min-width: 160px;
  height: 48px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  outline: none;
  color: #3498db;
  border-radius: 4px;
  text-align: center;
  line-height: 48px;
  transition: all 250ms ease;
  border: 0;
}
.rkemb:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.rkemb[data-color="default"] {
  background-color: #f9fafb;
  color: #3b82f6;
}
.rkemb[data-color="default"]:hover {
  background-color: #f3f4f6;
}
.rkemb[data-color="blue"] {
  background-color: #3b82f6;
  color: #fff;
}
.rkemb[data-color="blue"]:hover {
  background-color: #2563eb;
}
.rkemb[data-color="red"] {
  background-color: #ef4444;
  color: #fff;
}
.rkemb[data-color="red"]:hover {
  background-color: #dc2626;
}
.rkemb[data-color="yellow"] {
  background-color: #eab308;
  color: #fff;
}
.rkemb[data-color="yellow"]:hover {
  background-color: #ca8a04;
}
    `;
  };

  private initialize = (event: kintoneAPI.js.Event) => {
    window.addEventListener('beforeunload', this.beforeunload);
    if (!this.#logDisabled) {
      console.group(
        `${this.#logPrefix}%c${event.type} %c(${this.#uid})`,
        'color: #1e40af;',
        'color: #aaa'
      );
    }
  };

  private tarminate = () => {
    window.removeEventListener('beforeunload', this.beforeunload);
    if (!this.#logDisabled) {
      console.groupEnd();
    }
  };

  public set logDisabled(value: boolean) {
    this.#logDisabled = value;
  }

  public set logPrefix(value: string) {
    this.#logPrefix = value;
  }

  /** JavaScript中にページを離れようとした場合にアラートを表示します */
  private beforeunload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = '';
  }
}

/**
 * @deprecated 代わりに`KintoneEventListener`を使用してください
 */
export const KintoneEventListener = KintoneEventManager;
