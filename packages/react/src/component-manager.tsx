import { ReactElement } from 'react';
import { createRoot, Root } from 'react-dom/client';

type ComponentCache = {
  root: Root;
  rootElement: HTMLElement;
  parentElement: HTMLElement;
};

/**
 * ComponentManagerクラスは、Reactコンポーネントの管理を行います。
 * シングルトンパターンを使用して、アプリケーション内で唯一のインスタンスを提供します。
 */
export class ComponentManager {
  private static instance: ComponentManager;
  #debug: boolean = false;
  #components: Map<string, ComponentCache> = new Map();

  private constructor() {
    if (ComponentManager.instance) {
      throw new Error('Use ComponentManager.getInstance()');
    }
  }

  /**
   * ComponentManagerのインスタンスを取得します。
   * @returns ComponentManagerのシングルトンインスタンス
   */
  public static getInstance(): ComponentManager {
    if (!ComponentManager.instance) {
      ComponentManager.instance = new ComponentManager();
    }
    return ComponentManager.instance;
  }

  /**
   * 指定したパラメータを使用してコンポーネントをレンダリングします。
   * @throws コンポーネントのレンダリングに失敗した場合にエラーがスローされます。
   */
  public renderComponent(params: {
    /**
     * コンポーネントを一意に識別するためのID
     *
     * **このIDは、コンポーネントを識別するために使用されます。DOMの要素IDとは異なります。**
     */
    id: string;
    /**
     * レンダリングするReact要素
     *
     * この要素は、Reactの`ReactDOM.render`メソッドに渡すことができるものと同じです。
     */
    component: ReactElement;
    /**
     * コンポーネントを追加する親のHTMLElement
     *
     * この要素は、コンポーネントが追加される親要素です。省略した場合は`document.body`が使用されます。
     */
    parentElement?: HTMLElement;
    /**
     * ルート要素が準備できたときに呼び出されるコールバック
     *
     * @param element ルート要素
     */
    onRootElementReady?: (element: HTMLElement) => void;
  }): void {
    try {
      const { id, component, parentElement = document.body } = params;
      const existingComponent = this.#components.get(id);

      if (!existingComponent) {
        if (this.#debug) {
          console.log(
            `%c[ComponentManager] %c✨ コンポーネントを初期化しました id:${id}.`,
            'color: #0d9488;',
            'color: #6b7280;'
          );
        }
        const rootElement = document.createElement('div');
        rootElement.dataset['cmId'] = id;
        params.onRootElementReady?.(rootElement);
        parentElement.append(rootElement);
        const root = createRoot(rootElement);
        root.render(component);
        this.#components.set(id, { root, rootElement, parentElement });
      } else {
        if (this.#debug) {
          console.log(
            `%c[ComponentManager] %c♻ コンポーネントを更新しました id:${id}.`,
            'color: #0d9488;',
            'color: #6b7280;',
            'マウント先の親要素',
            parentElement,
            'マウント先の要素',
            existingComponent.rootElement
          );
        }

        if (existingComponent.parentElement !== parentElement) {
          existingComponent.parentElement.removeChild(existingComponent.rootElement);
        }
        if (!existingComponent.rootElement.isConnected) {
          parentElement.append(existingComponent.rootElement);
        }
        params.onRootElementReady?.(existingComponent.rootElement);
        existingComponent.root.render(component);
        this.#components.set(id, { ...existingComponent, parentElement });
      }
    } catch (error) {
      console.error(error);
      throw new Error('[Component Manager] コンポーネントのレンダリングに失敗しました');
    }
  }

  /**
   * 指定したelementIdのコンポーネントが存在するかを確認します。
   * @param elementId コンポーネントの識別子
   * @returns コンポーネントが存在する場合はtrue、存在しない場合はfalse
   */
  public hasComponent(elementId: string): boolean {
    return this.#components.has(elementId);
  }

  /**
   * 指定したelementIdのコンポーネントをアンマウントします。
   * この操作によってDOM上からコンポーネントが削除されますが、キャッシュは保持されます。
   * @param elementId アンマウントするコンポーネントの識別子
   */
  public destroyComponent(elementId: string): void {
    const component = this.#components.get(elementId);
    if (component) {
      if (this.#debug) {
        console.log(
          `%c[ComponentManager] %c🔥 コンポーネントを削除しました id:${elementId}.`,
          'color: #0d9488;',
          'color: #6b7280;'
        );
      }
      component.root.unmount();
      component.rootElement.remove();
      this.#components.delete(elementId);
    }
  }

  /**
   * デバッグモードを設定します。
   * @param value デバッグモードを有効にする場合はtrue、無効にする場合はfalse
   */
  public set debug(value: boolean) {
    this.#debug = value;
  }
}
