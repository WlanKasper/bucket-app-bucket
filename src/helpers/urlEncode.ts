export const URLEncode = (str: string) => {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export default URLEncode;
