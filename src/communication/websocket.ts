import { onCleanup } from "solid-js";
import { objectSignal } from "~/utils/signals";
import { setupClientHandlers } from "./websocketHandlers";

// ["CONNECTING", "CONNECTED", "CLOSING", "CLOSED", "ERROR", "RECONNECTING", "AUTHORISING"];

const clientSocket = {
  socket: undefined,
  token: "",
  phase: objectSignal("CLOSED"),
  messageListeners: new Map<string, Array<Function>>(),

  init(url: string, token?: string) {
    if (!url) throw new Error("Invalid URL");

    this.url = url;
    this.token = token;

    this.phase.set("CONNECTING");
    this.connect(url, token);
  },

  connect(url?: string, token?: string) {
    token = token ? token : this.token;
    url = url ? url : this.url;

    this.socket = new WebSocket(url);

    setupClientHandlers(this.socket, {
      token,
      messageListeners: this.messageListeners,
      emit: this.emit.bind(clientSocket),
      setPhase: this.phase.set,
      reconnect: this.connect.bind(clientSocket),
    });

    this.on("connect", () => {
      this.phase.set("CONNECTED");
    });
  },

  on(messageType: string, listener: Function) {
    const eventFunctions = this.messageListeners.get(messageType);
    if (!eventFunctions) return this.messageListeners.set(messageType, [listener]);

    eventFunctions.push(listener);
    return eventFunctions;
  },

  emit(type: string, data: Record<string, any>) {
    console.log("Emitting:", { type, data });

    JSON.stringify({ type, data });
    this.socket.send(JSON.stringify({ type, data }));
  },

  close() {
    this.socket.close();
  },
};
onCleanup(() => {
  clientSocket.close();
});
export { clientSocket };
