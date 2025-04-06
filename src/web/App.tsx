import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./home/HomePage";
import { useDispatch } from "react-redux";
import { bucketActions } from "@/store/bucket";
import { initApp } from "@/helpers/telegram/utils";

const App = () => {
  initApp();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bucketActions.sagaGetBuckets());
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default App;
