const client = {
  open: (e: Event, options: { emit; token; setPhase: Function }) => {
    const { emit, token, setPhase } = options;
    console.log("Socket Opened", e);
    setPhase("AUTHORISING");
    emit("connect", { token });
  },
  message: (e: MessageEvent, options: { messageListeners: Map<string, Function[]>; setPhase: Function }) => {
    const { messageListeners, setPhase } = options;
    try {
      JSON.parse(e.data);
    } catch (e) {
      return;
    }
    const message = JSON.parse(e.data);
    // if (message.type !== "pong") console.log("Socket Message", message);

    const listeners = messageListeners.get(message.type);
    if (!listeners) return;
    listeners.forEach((listener) => {
      listener(message.data);
    });
  },
  close: (e: CloseEvent, options: { setPhase: Function; reconnect }) => {
    const { setPhase, reconnect } = options;
    const { reason } = e;
    console.log("Socket Closed", e);
    setPhase("CLOSED");
    // reconnect();
    // setTimeout(() => {
    //   setPhase("RECONNECTING");
    // }, 100);
  },
  error: (e: Event, options: { setPhase: Function }) => {
    const { setPhase } = options;
    console.log("Socket Errored", e);
    setPhase("ERROR");
  },
};

const setupClientHandlers = (socket: WebSocket, options?: { token?: string; emit?: Function; setPhase: Function; messageListeners?: Map<string, Function[]>; reconnect }): void => {
  const { token, messageListeners, emit, setPhase, reconnect } = options;

  socket.addEventListener("open", (e) => client.open(e, { emit, token, setPhase }));
  socket.addEventListener("message", (e) => client.message(e, { messageListeners, setPhase }));
  socket.addEventListener("close", (e) => client.close(e, { setPhase, reconnect }));
  socket.addEventListener("error", (e) => client.error(e, { setPhase }));
};

// ///SERVER
// const server = {
//   open: () => {},
//   message: () => {},
//   close: () => {},
//   error: () => {},
// };
// const setupServerHandlers = (socket: WebSocket) => {
//   socket.addEventListener("open", server.open);
//   socket.addEventListener("message", server.message);
//   socket.addEventListener("close", server.close);
//   socket.addEventListener("error", server.error);
// };

export { setupClientHandlers };
