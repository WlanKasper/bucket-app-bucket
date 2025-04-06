import TMA from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import viewport from "@twa-dev/sdk";

export const initApp = () => {
  TMA.ready();
  TMA.expand();
  TMA.requestFullscreen();
};

export const getTelegramUser = () =>
  TMA.initDataUnsafe.user || {
    id: "1234567890",
    first_name: "Peter",
    photo_url: "",
  };

export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState(TMA.safeAreaInset);

  useEffect(() => {
    const handleChange = () => setInsets(TMA.safeAreaInset);

    viewport.onEvent("safeAreaChanged", handleChange);

    return () => {
      viewport.offEvent("safeAreaChanged", handleChange);
    };
  }, []);

  return insets;
};
