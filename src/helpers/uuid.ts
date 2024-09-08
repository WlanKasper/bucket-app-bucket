import uuid from "react-native-uuid";

export const generateShortUUID = () => {
  return uuid.v4();
};
