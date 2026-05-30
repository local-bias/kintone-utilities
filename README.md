# kintone-utilities

kintone customization and plugin utility packages maintained as a pnpm workspace.

## Packages

| Package | Purpose |
| --- | --- |
| `@konomi-app/kintone-utilities` | Core kintone REST API helpers, plugin config utilities, and shared types. |
| `@konomi-app/kintone-utilities-react` | React components and rendering helpers for kintone plugin UIs. |
| `@konomi-app/kintone-utilities-jotai` | Jotai atoms, hooks, and components for kintone customizations. |
| `@konomi-app/kintone-utilities-recoil` | Recoil hooks and components for kintone customizations. |
| `@konomi-app/ketch` | Fetch-compatible wrapper around `kintone.proxy` and `kintone.plugin.app.proxy`. |
| `@konomi-app/kintone-utilities-cloud` | API clients that run through kintone proxy. |
| `@konomi-app/kintone-schema-generator` | CLI and library for generating Zod schemas from kintone app fields. |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm pack:dry-run
```

[ホームページ](https://ribbit.konomi.app)
