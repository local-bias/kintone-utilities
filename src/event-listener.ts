import type { kintoneAPI } from './api-types';
import { withMobileEvents } from './utilities';

type ErrorHandler = (error: any, props: { event: kintoneAPI.Event }) => void;

type ConstructorProps = { errorHandler?: ErrorHandler };

export class KintoneEventListener {
  readonly #commonErrorHandler: ErrorHandler;

  /**
   * 複数の処理を、各イベントに登録することができます
   */
  public constructor(props?: ConstructorProps) {
    const { errorHandler = () => null } = props ?? {};

    this.#commonErrorHandler = errorHandler;
  }

  public add = <T = kintoneAPI.RecordData>(
    events: kintoneAPI.EventType[],
    callback: (event: kintoneAPI.Event<T>) => kintoneAPI.Event<T>
  ) => {
    const mobileEvents = withMobileEvents(events);

    kintone.events.on([...events, ...mobileEvents], async (event) => {
      try {
        return await callback(event);
      } catch (error) {
        await this.#commonErrorHandler(error, { event });
        throw error;
      }
    });
  };
}
