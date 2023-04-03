export type KintoneConfig = {
  apps: { dev: number; prod: number; name: string }[];
  kvs?: Record<string, { dev: string; prod: string }>;
};
