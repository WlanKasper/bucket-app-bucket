import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./home/HomePage";
import StartPage from "./start/StartPage";
import { useDispatch } from "react-redux";
import { bucketActions } from "@/store/bucket";
import { getTelegramUser, initApp } from "@/helpers/telegram/utils";
import { socketService } from "@/service/socket/socket";

const App = () => {
  initApp();
  const user = getTelegramUser();
  const dispatch = useDispatch();

  const isOnboarded = localStorage.getItem("onboarded") === "true";

  useEffect(() => {
    if (user?.id) {
      const userIdStr = user.id.toString();
      const username = user.username || user.first_name || `user${user.id}`;

      // Set user info in Redux
      dispatch(bucketActions.setUserId(userIdStr));
      dispatch(bucketActions.setUsername(username));
      dispatch(bucketActions.sagaGetBuckets({ userId: userIdStr, username: user.username }));

      // Register user in backend
      dispatch(
        bucketActions.sagaRegisterUser({
          telegramUserId: userIdStr,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
        })
      );

      // Connect to WebSocket
      socketService.connect(userIdStr, username);
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [dispatch, user?.id]);

  return (
    <Routes>
      <Route
        path="/"
        element={isOnboarded ? <Navigate to="/home" replace /> : <StartPage />}
      />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  );
};

export default App;
