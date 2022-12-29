import { extractCookies } from "./cookie.ts";

import * as JWT from "https://deno.land/x/djwt@v2.8/mod.ts";

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const create = async (payload: { uuid: string; [k: string]: unknown }) => {
  const { uuid } = payload;
  return await JWT.create({ alg: "HS512", typ: "JWT" }, {
    uuid,
    exp: JWT.getNumericDate(60 * 60),
  }, key);
};

const verify = async (token: string) => {
  return await JWT.verify(token, key);
};

const isAuthorised = async (
  req: Request | string,
): Promise<JWT.Payload | null> => {
  const discoToken = typeof req === "string"
    ? req
    : extractCookies(req)?.discoToken ?? "";
  if (!discoToken) return null;
  try {
    const payload = await verify(discoToken);
    console.log("Payload:", payload);

    return payload;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { create, isAuthorised, verify };
