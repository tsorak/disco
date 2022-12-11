import { Accessor, Setter, createEffect } from "solid-js";

const pinger = {
  intervalId: -1,
  timeSent: -1,

  init(options: { connectedState: Accessor<string>; emit: Function; on: Function; ms: { get: Accessor<number>; set: Setter<number> } }) {
    const { connectedState, emit, on, ms } = options;

    createEffect(() => {
      if (connectedState() === "CONNECTED") {
        this.start(emit, ms.get);
      } else if (connectedState() === "CLOSED") {
        this.stop();
      }
    });

    on("pong", (data) => {
      ms.set(data.time - this.timeSent);
    });
  },
  start(emit: Function, getMs: Function) {
    this.intervalId = setInterval(() => {
      const id = crypto.randomUUID();
      emit("ping", { id, ms: getMs() });
      this.timeSent = Date.now();
    }, 1000);
  },
  stop() {
    clearInterval(this.intervalId);
  },
};

export { pinger };
