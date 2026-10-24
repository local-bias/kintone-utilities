# @konomi-app/kintone-utilities-react

kintone plugin component

## Import paths

The root entry point remains available and supports tree-shaking in ESM bundlers.
For CommonJS or for an explicit dependency boundary, import from the smallest matching subpath:

```ts
import { embed } from '@konomi-app/kintone-utilities-react/lib';
import { ComponentManager } from '@konomi-app/kintone-utilities-react/component-manager';
import { createPluginMuiTheme } from '@konomi-app/kintone-utilities-react/theme';
```

The following subpaths are available:

- `lib`
- `event-listener`
- `component-manager`
- `theme`
- `components`
- `components/embeddable-input`
- `components/field-condition-input`
- `components/field-condition-input/actions`
- `components/field-condition-input/types`
- `plugin`
- `plugin/banner`
- `plugin/content`
- `plugin/footer`
- `plugin/footer/root`
- `plugin/layout`
- `plugin/sidebar`
- `plugin/sidebar/root`
- `plugin/ui`
- `plugin/ui/form-description`
- `plugin/ui/form-section`
- `plugin/ui/form-title`
- `plugin-config`
- `plugin-config/context`
- `plugin-config/hooks`
- `plugin-config/render`
- `plugin-config/notification`
