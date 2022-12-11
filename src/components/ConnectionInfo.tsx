import { Accessor, Component, createEffect, onCleanup, Show } from "solid-js";

import { RefreshCw, Loader2 } from "lucide-solid";

const ConnectionInfo: Component = (props: { connectionState: Function; ms: Function; reconnect: Function }) => {
  const { connectionState, ms, reconnect } = props;

  let updateDot: HTMLDivElement;

  createEffect(() => {
    let timerId;

    ms();
    if (updateDot) {
      updateDot.classList.add("animate-ping");
      timerId = setTimeout(() => {
        updateDot.classList.remove("animate-ping");
      }, 250);
    }
    onCleanup(() => {
      clearTimeout(timerId);
    });
  });
  return (
    <div class="connectionInfo select-none text-white">
      <Show when={["CONNECTING", "RECONNECTING"].includes(connectionState())}>
        <h1 class="px-1 bg-yellow-600 flex justify-between items-center">
          {connectionState() === "CONNECTING" ? "Connecting" : "Reconnecting"}
          <span class="h-4 animate-spin">
            <Loader2 size={"1rem"} />
          </span>
        </h1>
      </Show>
      <Show when={connectionState() === "AUTHORISING"}>
        <h1 class="px-1 bg-blue-600">Authorising...</h1>
      </Show>
      <Show when={connectionState() === "CLOSED"}>
        <h1 class="px-1 bg-red-700 flex justify-between items-center">
          Disconnected
          <span class="flex w-min">
            <button onclick={() => reconnect()}>
              <RefreshCw size={"1rem"} />
            </button>
          </span>
        </h1>
      </Show>
      <Show when={connectionState() === "CONNECTED"}>
        <h1 class="px-1 bg-green-700 flex justify-between items-center">
          Connected
          <Show when={ms() >= 0}>
            <span class="relative">
              {ms()}ms<div class="absolute w-0.5 h-0.5 rounded-full bg-white top-1 right-0 animate-ping" ref={updateDot}></div>
            </span>
          </Show>
        </h1>
      </Show>
    </div>
  );
};

export default ConnectionInfo;
