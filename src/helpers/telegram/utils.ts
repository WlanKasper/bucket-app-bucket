import TMA from "@twa-dev/sdk";

export const initApp = () => {
  TMA.ready();
  TMA.expand();
};

export const getTelegramUser = () => TMA.initDataUnsafe.user;
