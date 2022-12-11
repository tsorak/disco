import { Component, createEffect, onCleanup, Switch, Match, Show, createSignal } from "solid-js";

import { RefreshCw, Slash, Loader2, ChevronDown } from "lucide-solid";

const ConnectionInfo: Component = (props: { connectionState: Function; ms: Function; reconnect: Function; closeReason: Function }) => {
  const { connectionState, ms, reconnect, closeReason } = props;

  let updateDot: HTMLDivElement;
  let reasonElem: HTMLSpanElement;

  //peek reason
  createEffect(() => {
    let timerId;

    if (closeReason().reason.length > 0 && reasonElem) {
      reasonElem.style.height = "16px";
      timerId = setTimeout(() => {
        reasonElem.style.height = "";
      }, 1500);
    }
    onCleanup(() => {
      clearTimeout(timerId);
    });
  });

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
    <div class={`${["CONNECTING", "RECONNECTING"].includes(connectionState()) ? "bg-yellow-600" : ""} ${connectionState() === "AUTHORISING" ? "bg-blue-600" : ""} ${connectionState() === "CLOSED" ? "bg-red-600" : ""} ${connectionState() === "CONNECTED" ? "bg-green-700" : ""} px-1 connectionInfo select-none text-white transition-colors duration-300`}>
      <Switch>
        <Match when={["CONNECTING", "RECONNECTING"].includes(connectionState())}>
          <h1 class="flex justify-between items-center">
            {connectionState() === "CONNECTING" ? "Connecting" : "Reconnecting"}
            <span class="h-4 animate-spin">
              <Loader2 size={"1rem"} />
            </span>
          </h1>
        </Match>
        <Match when={connectionState() === "AUTHORISING"}>
          <h1>Authorising...</h1>
        </Match>
        <Match when={connectionState() === "CLOSED"}>
          <h1 class="flex justify-between items-center group">
            <div class="flex flex-col overflow-hidden">
              <span class="flex items-center">Disconnected {closeReason().reason.length > 0 && <ChevronDown size={"1rem"} />}</span>
              <span class={`${closeReason().reason.length > 0 ? "group-hover:h-4" : ""} h-0 transition-size text-xs`} ref={reasonElem}>
                {closeReason().reason}
              </span>
            </div>
            <span class="flex w-min">
              {/* disabled={closeReason().reason.length > 0} */}
              <button onclick={() => reconnect()}>
                <Show when={closeReason().reason !== "Invalid token"} fallback={<Slash size={"1rem"} />}>
                  <RefreshCw size={"1rem"} />
                </Show>
              </button>
            </span>
          </h1>
        </Match>
        <Match when={connectionState() === "CONNECTED"}>
          <h1 class="flex justify-between items-center">
            Connected
            <Show when={ms() >= 0}>
              <span class="relative">
                {ms()}ms<div class="absolute w-0.5 h-0.5 rounded-full bg-white top-1 right-0 animate-ping" ref={updateDot}></div>
              </span>
            </Show>
          </h1>
        </Match>
      </Switch>
    </div>
  );
};

export default ConnectionInfo;
