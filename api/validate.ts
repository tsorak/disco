const jwt = {
    create: () => {},
    isValid: (cookie: string) => {
        return cookie === "123" ? true : false;
    },
};

export function isAuthorized(token: string) {
    try {
        if (!token) throw new Error("No token found");
        console.log("Token is:", token);

        if (!jwt.isValid(token)) throw new Error(`Invalid token: ${token}`);
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
}
