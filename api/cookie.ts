const extractCookies = (req: Request): Record<string, string> => {
  return Object.fromEntries(
    req.headers
      .get("cookie")
      ?.replaceAll(";", "")
      .split(" ")
      .map((c) => c.split("=")) ?? [],
  );
};

export { extractCookies };
