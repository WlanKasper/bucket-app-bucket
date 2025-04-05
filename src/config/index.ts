export type Config = {
  BUCKET_SERVER_ENDPOINT: string;
};

const config: Config = {
  BUCKET_SERVER_ENDPOINT: process.env.VITE_API_URL || "",
};

export default config;
