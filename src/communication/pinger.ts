const pinger = {
  intervalId: -1,
  timeSent: -1,

  start(emit: Function, ms: { get: Function; set: Function }, on: Function) {
    this.intervalId = setInterval(() => {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now();
      emit("ping", { id, ms: ms.get() });
      this.timeSent = Date.now();
    }, 1000);

    on("pong", (data) => {
      ms.set(data.time - this.timeSent);
    });
  },
  stop() {
    clearInterval(this.intervalId);
  },
};

export { pinger };
