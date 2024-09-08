export type Config = {
  BUCKET_SERVER_ENDPOINT: string;
};

const config: Config = {
  BUCKET_SERVER_ENDPOINT: process.env.EXPO_PUBLIC_APP_BUCKET_SERVER_ENDPOINT || "",
};

export default config;
