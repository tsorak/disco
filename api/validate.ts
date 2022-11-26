const jwt = {
  create: () => {},
  isValid: (cookie: string) => {
    return cookie === "123" ? true : false;
  },
};

export function isAuthorized(cookies: Map<string, string>) {
  try {
    const discoToken = cookies.get("discoToken");
    if (!discoToken) throw new Error("No token found");
    console.log("Token is:", discoToken);

    if (!jwt.isValid(discoToken)) throw new Error(`Invalid token: ${discoToken}`);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}
