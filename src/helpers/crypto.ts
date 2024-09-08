import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

import URLEncode from "./urlEncode";

const sha256 = async (buffer: string) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
};

const sha256Hex = async (buffer: string) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, buffer, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
};

//codifica stringa in base64
const encodeToBase64 = (value: string) => {
  return Buffer.from(value).toString("base64");
};

const buildCodeVerifier = async () => {
  // expo-random is deprecated in favor of expo-crypto: use ExpoCrypto.assertByteCount()instead.
  // const randomBytes = await Random.getRandomBytesAsync(32);
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const base64String = Buffer.from(randomBytes).toString("base64");
  return base64String;
};

const buildCodeChallenge = async (codeVerifier: string) => {
  return URLEncode(await sha256(codeVerifier));
};

/**
 * How to use
 *
 *  - Build code verifier before
 *  const verifier = await buildCodeVerifier();
 *
 *  - Build code challenge starting for code verifier
 *  const challenge = await buildCodeChallenge(verifier);
 */

export { sha256, sha256Hex, encodeToBase64, buildCodeVerifier, buildCodeChallenge };
