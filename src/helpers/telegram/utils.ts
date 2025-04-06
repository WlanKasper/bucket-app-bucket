import TMA from "@twa-dev/sdk";

export const initApp = () => {
  TMA.ready();
  if (TMA.isVersionAtLeast("8.0")) {
    TMA.requestFullscreen();
  }
};

export const getTelegramUser = () =>
  TMA.initDataUnsafe.user || {
    id: "1234567890",
    first_name: "Peter",
    photo_url: "",
  };
