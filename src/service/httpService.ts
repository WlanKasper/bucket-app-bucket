import axios from "axios";
import Config from "@/config";

const { BUCKET_SERVER_ENDPOINT } = Config;

const defaultOptions = {
  baseURL: `${BUCKET_SERVER_ENDPOINT}`,
  method: "get",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json",
  },
};

const instance = axios.create(defaultOptions);

instance.interceptors.request.use(
  async function (config) {
    // Do something with config
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const expectedError = error?.response && error?.response?.status >= 400 && error?.response?.status < 500;

    if (!expectedError) {
      console.error(error);

      if (error?.response?.data) {
        console.error(error);
      }
    }

    if (error?.response?.data) {
      return Promise.reject(error?.response?.data);
    } else {
      return Promise.reject(error);
    }
  }
);

// Set the AUTH token for any request
function setJwt(jwt: string) {
  instance.defaults.headers["token"] = "";
  delete instance.defaults.headers["token"];
  if (jwt) {
    instance.defaults.headers["token"] = jwt;
  }
}

export default {
  instance: instance,
  request: instance.request,
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete,
  setJwt,
};
