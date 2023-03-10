import { css } from '@emotion/css';

type ConstructorProps = Readonly<Partial<{ label: string; progress: number }>>;

const ROOT_ID = '__🐸__loading-overlay';

export class LoadingOverlay {
  #shown: boolean;
  #label: string;
  #progress: number | null;
  #root: HTMLDivElement;

  public constructor(props: ConstructorProps = {}) {
    this.#shown = false;
    this.#label = props.label || '';
    this.#progress = props.progress ?? null;

    this.addStyle();

    const root =
      document.querySelector<HTMLDivElement>(`#${ROOT_ID}`) || document.createElement('div');
    root.id = ROOT_ID;
    this.#root = root;
    document.body.append(root);
    this.render();
  }

  public start(): void {
    this.#shown = true;
    window.removeEventListener('beforeunload', this.beforeunload);
    this.render();
  }

  public stop(): void {
    this.#shown = false;
    window.removeEventListener('beforeunload', this.beforeunload);
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
      this.#root.innerHTML = `
      <div>
        <div class="loader"></div>
        <div>${this.#label}</div>
      </div>`;
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
        opacity: 0;

        font-family: 'Yu Gothic Medium', '游ゴシック', YuGothic, 'メイリオ',
          'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
        color: #356;
        font-size: 17px;

        overflow: hidden;
        background-color: #fff3;
        background-image: radial-gradient(#fff, transparent 50%);
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
          gap: 16px;
        }

        .loader {
          font-size: 48px;
          width: 1em;
          height: 1em;
          position: relative;

          &:before,
          &:after {
            content: '';
            position: absolute;
            inset: 0;
            border: 2px solid #2563ebaa;
            animation: spin 2s infinite ease;
          }

          &:after {
            animation-delay: -1.25s;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
            border-radius: 1em;
          }
          50% {
            border-radius: 0.25em;
          }
          100% {
            transform: rotate(180deg);
            border-radius: 1em;
          }
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
