import React, { useEffect, useLayoutEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";
import { Stack } from "expo-router";
import configureStore from "@/store/configureStore";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { ActivityIndicator, View } from "react-native";

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
  const dispatch = useDispatch();
  const loading = useSelector(bucketSelectors.isLoading);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    dispatch(bucketActions.sagaGetBuckets());
  }, []);

  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading]);

  if (isInitialLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack initialRouteName="(home)">
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
