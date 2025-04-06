import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./home/HomePage";
import { useDispatch } from "react-redux";
import { bucketActions, bucketReducer } from "@/store/bucket";
import { getTelegramUser, initApp } from "@/helpers/telegram/utils";

const App = () => {
  initApp();
  const user = getTelegramUser();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bucketActions.setUserId(user?.id));
    dispatch(bucketActions.sagaGetBuckets(user?.id.toString() || ""));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default App;
