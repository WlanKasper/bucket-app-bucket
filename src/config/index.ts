export type Config = {
  BUCKET_SERVER_ENDPOINT: string;
};

const config: Config = {
  BUCKET_SERVER_ENDPOINT: process.env.API_URL || "",
};

export default config;
