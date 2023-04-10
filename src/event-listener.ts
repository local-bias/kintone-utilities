import type { kintoneAPI } from './types/api';
import { withMobileEvents } from './utilities';

type ErrorHandler = (error: any, props: { event: kintoneAPI.Event }) => void;

type ConstructorProps = Partial<{
  errorHandler: ErrorHandler;
  pluginId: string;
  logDisabled: boolean;
}>;

export class KintoneEventListener {
  readonly #uid: string = Math.random().toString(36).slice(2);
  readonly #pluginId?: string;
  readonly #commonErrorHandler: ErrorHandler;
  #logDisabled: boolean;

  /**
   * 複数の処理を、各イベントに登録することができます
   */
  public constructor(props?: ConstructorProps) {
    const { errorHandler = () => null, pluginId, logDisabled = false } = props ?? {};

    this.#commonErrorHandler = errorHandler;
    this.#pluginId = pluginId;
    this.#logDisabled = logDisabled;
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
    events: kintoneAPI.EventType[],
    callback: (
      event: kintoneAPI.Event<T>,
      options?: { pluginId?: string }
    ) => kintoneAPI.Event<T> | Promise<kintoneAPI.Event<T>>
  ) => {
    kintone.events.on(withMobileEvents(events), async (event) => {
      try {
        window.addEventListener('beforeunload', this.beforeunload);
        if (!this.#logDisabled) {
          console.group(`%c${event.type} %c(${this.#uid})`, 'color: #1e40af;', 'color: #aaa');
        }
        return await callback(event, { pluginId: this.#pluginId });
      } catch (error) {
        await this.#commonErrorHandler(error, { event });
        throw error;
      } finally {
        window.removeEventListener('beforeunload', this.beforeunload);
        if (!this.#logDisabled) {
          console.groupEnd();
        }
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
    callback: (event: kintoneAPI.Event<T>, options?: { pluginId?: string }) => kintoneAPI.Event<T>
  ) => {
    kintone.events.on(withMobileEvents(events), (event) => {
      try {
        window.addEventListener('beforeunload', this.beforeunload);
        if (!this.#logDisabled) {
          console.group(`%c${event.type} %c(${this.#uid})`, 'color: #1e40af;', 'color: #aaa');
        }
        return callback(event, { pluginId: this.#pluginId });
      } catch (error) {
        this.#commonErrorHandler(error, { event });
        throw error;
      } finally {
        window.removeEventListener('beforeunload', this.beforeunload);
        if (!this.#logDisabled) {
          console.groupEnd();
        }
      }
    });
  };

  public set logDisabled(value: boolean) {
    this.#logDisabled = value;
  }

  /** JavaScript中にページを離れようとした場合にアラートを表示します */
  private beforeunload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = '';
  }
}
