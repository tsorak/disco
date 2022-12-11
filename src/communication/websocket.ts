import { buildSignal } from "~/utils/signals";
import { setupClientHandlers } from "./websocketHandlers";
import { pinger } from "./pinger";

// ["CONNECTING", "CONNECTED", "CLOSING", "CLOSED", "ERROR", "RECONNECTING", "AUTHORISING"];

const clientSocket = {
  socket: undefined,
  token: "",
  phase: buildSignal("CLOSED"),
  ms: buildSignal(-1, { equals: false }),
  messageListeners: new Map<string, Array<Function>>(),

  init(url: string, token?: string) {
    if (!url) throw new Error("Invalid URL");

    this.url = url;
    this.token = token;

    this.connect(url, token);

    pinger.init({ connectionState: this.phase.get, emit: this.emit.bind(this), on: this.on.bind(this), ms: this.ms });
  },

  connect(url?: string, token?: string) {
    this.phase.set("CONNECTING");

    token = token ? token : this.token;
    url = url ? url : this.url;

    this.socket = new WebSocket(url);

    setupClientHandlers(this.socket, {
      token,
      messageListeners: this.messageListeners,
      emit: this.emit.bind(this),
      setPhase: this.phase.set,
      reconnect: this.connect.bind(this),
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
    if (type !== "ping") {
      console.log("Emitting:", { type, data });
    }

    JSON.stringify({ type, data });
    this.socket.send(JSON.stringify({ type, data }));
  },

  close() {
    this.socket.close();
    this.messageListeners.clear();
    pinger.stop();
    this.ms.set(-1);
  },
};
export { clientSocket };
