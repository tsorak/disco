import { buildSignal } from "~/utils/signals";
import { setupClientHandlers } from "./websocketHandlers";
import { pinger } from "./pinger";
import { createEffect } from "solid-js";

// ["CONNECTING", "CONNECTED", "CLOSING", "CLOSED", "ERROR", "RECONNECTING", "AUTHORISING"];

const clientSocket = {
  socket: undefined,
  token: "",
  phase: buildSignal("CLOSED"),
  ms: buildSignal(-1, { equals: false }),
  closeReason: buildSignal({ code: -1, reason: "" }),
  messageListeners: new Map<string, Array<Function>>(),

  init(url: string, token?: string) {
    if (!url) throw new Error("Invalid URL");

    this.url = url;
    this.token = token;

    this.connect(url, token);

    createEffect(() => {
      if (this.phase.get() === "CONNECTED") {
        pinger.start(this.emit.bind(this), this.ms, this.on.bind(this));
      } else if (this.phase.get() === "CLOSED") {
        pinger.stop();
      }
    });
  },

  connect(url?: string, token?: string) {
    this.reset();
    this.phase.set("CONNECTING");

    token = token ? token : this.token;
    url = url ? url : this.url;

    this.socket = new WebSocket(url);

    setupClientHandlers(this.socket, {
      token,
      messageListeners: this.messageListeners,
      emit: this.emit.bind(this),
      setPhase: this.phase.set,
      setCloseReason: this.closeReason.set,
    });

    this.on("connect", () => {
      this.phase.set("CONNECTED");
    });
  },

  on(messageType: string, listener: Function, overwrite: boolean = true) {
    const eventFunctions = this.messageListeners.get(messageType);
    if (!eventFunctions) return this.messageListeners.set(messageType, [listener]);

    if (overwrite) {
      this.messageListeners.set(messageType, [listener]);
    } else {
      eventFunctions.push(listener);
    }
    return eventFunctions;
  },

  emit(type: string, data: Record<string, any>) {
    if (type !== "ping") {
      console.log("Emitting:", { type, data });
    }

    JSON.stringify({ type, data });
    this.socket.send(JSON.stringify({ type, data }));
  },

  reset() {
    // this.messageListeners.clear();
    pinger.stop();
    this.ms.set(-1);
    this.closeReason.set({ code: -1, reason: "" });
  },

  close() {
    this.socket.close();
    this.reset();
  },
};
export { clientSocket };
