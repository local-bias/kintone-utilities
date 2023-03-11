import { css } from '@emotion/css';

type ConstructorProps = Readonly<Partial<{ label: string; progress: number }>>;

export class LoadingOverlay {
  #shown: boolean;
  #label: string | string[];
  #html: string;
  #progress: number | null;

  #root: HTMLDivElement;
  #loaderElement: HTMLDivElement;
  #progressElement: HTMLDivElement;
  #contentElement: HTMLDivElement;

  public constructor(props: ConstructorProps = {}) {
    this.#shown = false;
    this.#label = props.label || '';
    this.#html = '';
    this.#progress = props.progress ?? null;

    const root = document.createElement('div');
    this.#root = root;
    document.body.append(root);

    const container = document.createElement('div');
    container.classList.add('__c');
    this.#root.append(container);

    const loaderElement = document.createElement('div');
    loaderElement.classList.add('__l');
    this.#loaderElement = loaderElement;
    container.append(loaderElement);

    const progressElement = document.createElement('div');
    progressElement.classList.add('__p');
    this.#progressElement = progressElement;
    container.append(progressElement);

    const contentElement = document.createElement('div');
    this.#contentElement = contentElement;
    container.append(contentElement);

    this.addStyle();
    this.render();
  }

  public show(): void {
    this.#shown = true;
    this.#loaderElement.style.animationName = 'spin';
    window.removeEventListener('beforeunload', this.beforeunload);
    document.body.style.overflow = 'hidden';
    this.render();
  }

  public hide(): void {
    this.#shown = false;
    this.#progress = 0;
    this.#loaderElement.style.animationName = '';
    window.removeEventListener('beforeunload', this.beforeunload);
    document.body.style.overflow = 'auto';
    this.render();
  }

  public set label(label: string) {
    this.#label = label;
    this.render();
  }

  public set progress(progress: number) {
    this.#progress = progress;
    this.render();
  }

  private render(): void {
    this.#root.style.opacity = this.#shown ? '1' : '0';
    this.#root.style.pointerEvents = this.#shown ? 'all' : 'none';

    this.#progressElement.style.width = `${this.#progress}%`;

    if (this.#html) {
      this.#contentElement.innerHTML = this.#html;
    } else {
      if (this.#label instanceof Array) {
        this.#contentElement.innerHTML = `<div>${this.#label.join('</div><div>')}</div>`;
      } else {
        this.#contentElement.innerText = this.#label;
      }
    }
  }

  /** JavaScript中にページを離れようとした場合にアラートを表示します */
  private beforeunload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = '';
  }

  private addStyle() {
    this.#root.classList.add(css`
      font-family: 'Yu Gothic Medium', '游ゴシック', YuGothic, 'メイリオ',
        'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      color: #356;
      font-size: 17px;

      overflow: hidden;
      background-color: #fff6;
      backdrop-filter: blur(10px);
      box-sizing: content-box;

      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;

      display: grid;
      place-items: center;
      transition: all 250ms ease;
      z-index: 1000;
      opacity: 0;
      transition: all 250ms ease;

      .__c {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 32px;
        padding: 32px 64px;
        background-color: #fffc;
        border-radius: 8px;
        box-shadow: 0 5px 24px -6px #0002;
        min-width: 300px;
        max-width: 90vw;
        min-height: 200px;
        position: relative;
        overflow: hidden;
      }

      .__l {
        font-size: 48px;
        width: 1em;
        height: 1em;
        position: relative;
        border: 2px solid #2563ebaa;
        animation: spin 2s infinite ease;
      }

      .__p {
        position: absolute;
        bottom: 0px;
        left: 0;
        width: 0%;
        height: 3px;
        background-color: #2563eb;
        transition: all 250ms ease;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
          border-radius: 1em;
        }
        20% {
          transform: rotate(0deg);
        }
        30%,
        60% {
          border-radius: 0.25em;
        }
        70% {
          transform: rotate(180deg);
        }
        100% {
          transform: rotate(180deg);
          border-radius: 1em;
        }
      }
    `);
  }
}
