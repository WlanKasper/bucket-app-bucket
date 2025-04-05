import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./home/HomePage";
import { useDispatch } from "react-redux";
import { bucketActions } from "@/store/bucket";
import Config from "@/config";

const App = () => {
  const { BUCKET_SERVER_ENDPOINT } = Config;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bucketActions.sagaGetBuckets());
  }, []);

  console.log("API URL:", BUCKET_SERVER_ENDPOINT);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default App;
