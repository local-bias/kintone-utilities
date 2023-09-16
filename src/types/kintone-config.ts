export type KintoneConfig = {
  baseUrl?: { dev: string; prod: string };
  apps: { dev: number; prod: number; name: string }[];
  kvs?: Record<string, { dev: string; prod: string }>;
};
