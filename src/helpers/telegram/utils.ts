import TMA from "@twa-dev/sdk";

export const initApp = () => {
  TMA.ready();
  TMA.expand();
};

export const getTelegramUser = () =>
  TMA.initDataUnsafe.user || {
    id: "1234567890",
    first_name: "Peter",
    photo_url: "",
  };
