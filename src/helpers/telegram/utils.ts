import TMA from "@twa-dev/sdk";

export const initApp = () => {
  try {
    TMA.ready();
    TMA.expand();

    // Only use features available in current version
    if (TMA.isVersionAtLeast("6.1")) {
      TMA.setHeaderColor("#FFFFFF");
      TMA.setBackgroundColor("#F5F5F5");
    }

    if (TMA.isVersionAtLeast("6.2")) {
      TMA.enableClosingConfirmation();
    }

    if (TMA.isVersionAtLeast("8.0")) {
      TMA.requestFullscreen();
    }
  } catch (error) {
    // Running outside Telegram - silently ignore
  }
};

export const getTelegramUser = () => {
  try {
    return (
      TMA.initDataUnsafe.user || {
        id: Date.now(),
        first_name: "Guest",
        photo_url: "",
      }
    );
  } catch {
    return {
      id: Date.now(),
      first_name: "Guest",
      photo_url: "",
    };
  }
};

export const hapticFeedback = (type: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") => {
  try {
    if (TMA.isVersionAtLeast("6.1")) {
      TMA.HapticFeedback.impactOccurred(type);
    }
  } catch {
    // Haptic feedback not available
  }
};

export const hapticNotification = (type: "error" | "success" | "warning") => {
  try {
    if (TMA.isVersionAtLeast("6.1")) {
      TMA.HapticFeedback.notificationOccurred(type);
    }
  } catch {
    // Haptic feedback not available
  }
};

export const showBackButton = (onClick: () => void) => {
  try {
    TMA.BackButton.show();
    TMA.BackButton.onClick(onClick);
  } catch {
    // Back button not available
  }
};

export const hideBackButton = () => {
  try {
    TMA.BackButton.hide();
  } catch {
    // Back button not available
  }
};

export const isTelegramApp = (): boolean => {
  try {
    return Boolean(TMA.initDataUnsafe.user);
  } catch {
    return false;
  }
};

