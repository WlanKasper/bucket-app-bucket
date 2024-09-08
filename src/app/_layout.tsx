import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Stack } from "expo-router";
import configureStore from "@/store/configureStore";

export const RootLayout = () => {
  return <RootLayoutNav />;
};

const RootLayoutNav = () => {
  const store = configureStore();

  return (
    <ReduxProvider store={store}>
      <Navigation />
    </ReduxProvider>
  );
};

const Navigation = () => {
  return (
    <Stack initialRouteName="(home)">
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
