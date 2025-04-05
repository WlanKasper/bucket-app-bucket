const getEnvConstant = (path: string): string => {
  const w = window as never;
  return w['_env_'][path] as string;
};

export const APP_URL = getEnvConstant('VITE_BASE_URL');
export const API_URL = getEnvConstant('VITE_API_URL');
