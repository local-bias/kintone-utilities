import { css } from '@emotion/css';

type ConstructorProps = Readonly<Partial<{ label: string; progress: number }>>;

const ROOT_ID = '__🐸__loading-overlay';

export class LoadingOverlay {
  #shown: boolean;
  #label: string | string[];
  #html: string;
  #progress: number | null;
  #root: HTMLDivElement;
  #variable: HTMLDivElement;

  public constructor(props: ConstructorProps = {}) {
    this.#shown = false;
    this.#label = props.label || '';
    this.#html = '';
    this.#progress = props.progress ?? null;

    this.addStyle();

    const root =
      document.querySelector<HTMLDivElement>(`#${ROOT_ID}`) || document.createElement('div');
    root.id = ROOT_ID;
    this.#root = root;
    document.body.append(root);

    const container = document.createElement('div');
    this.#root.append(container);
    container.innerHTML = `<div class="loader"></div>`;

    const variable = document.createElement('div');
    container.append(variable);
    this.#variable = variable;

    this.render();
  }

  public start(): void {
    this.#shown = true;
    window.removeEventListener('beforeunload', this.beforeunload);
    document.body.style.overflow = 'hidden';
    this.render();
  }

  public stop(): void {
    this.#shown = false;
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
    if (this.#shown) {
      if (this.#html) {
        this.#variable.innerHTML = `<div>${this.#label}</div><div class="progress" style="width: ${
          this.#progress
        }%"></div>`;
      } else {
        if (this.#label instanceof Array) {
          this.#variable.innerHTML = `<div>${this.#label.join(
            '<br>'
          )}</div><div class="progress" style="width: ${this.#progress}%"></div>`;
        } else {
          this.#variable.innerHTML = `<div>${
            this.#label
          }</div><div class="progress" style="width: ${this.#progress}%"></div>`;
        }
      }
    }
  }

  /** JavaScript中にページを離れようとした場合にアラートを表示します */
  private beforeunload(event: BeforeUnloadEvent) {
    event.preventDefault();
    event.returnValue = '';
  }

  private addStyle() {
    document.body.classList.add(css`
      #${ROOT_ID} {
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

        @keyframes appear {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        > div {
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

        .loader {
          font-size: 48px;
          width: 1em;
          height: 1em;
          position: relative;
          border: 2px solid #2563ebaa;
          animation: spin 2s infinite ease;
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

        .progress {
          position: absolute;
          bottom: 0px;
          left: 0;
          width: 60%;
          height: 3px;
          background-color: #2563eb;
          transition: all 250ms ease;
        }
      }
    `);
  }
}

/**
 *       ${({ shown }) => (shown ? 'animation: appear 150ms ease 0s 1 forwards;' : '')};
      pointer-events: ${({ shown }) => (shown ? 'initial' : 'none')};
 */

/** ロード画面操作用クラスのシングルトン */
export const loadingOverlay = new LoadingOverlay();
