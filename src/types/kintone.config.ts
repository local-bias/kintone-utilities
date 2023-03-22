export type KintoneConfig = {
  apps: { dev: number; prod: number; name: string }[];
  kv?: Record<string, Record<string, string>>;
};
