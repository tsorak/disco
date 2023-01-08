import { Accessor, Component, createEffect, createSignal, onCleanup, onError, Show } from "solid-js";
import DiscoAvatar from "./DiscoAvatar";

import { setActiveOverlay } from "./Overlay";

import type { tUserData } from "~/utils/types";

const UserProfileMin: Component<{ getUserData: Accessor<tUserData> }> = (props) => {
  const { getUserData } = props;
  const [shouldScroll, setShouldScroll] = createSignal(false);

  let avatar; //TODO: make apart of userData
  let nameElem: HTMLParagraphElement | undefined;

  const scroller = {
    intervalID: -1,

    maxScrollWidth(element?: HTMLElement) {
      if (!element) return undefined;
      return element.scrollWidth - element.clientWidth;
    },

    start(element: HTMLElement) {
      this.intervalID = setInterval(() => {
        if (element.scrollLeft < this.maxScrollWidth(element)) {
          element.scrollLeft++;
        } else {
          element.scrollLeft = this.maxScrollWidth(element);
          clearInterval(this.intervalID);
        }
      }, 42);
    },

    stop(element: HTMLElement) {
      clearInterval(this.intervalID);
      if (element) element.scrollLeft = 0;
    },
  };

  createEffect(() => {
    shouldScroll();
    if (!scroller.maxScrollWidth(nameElem)) return;

    if (shouldScroll()) {
      scroller.start(nameElem);
    } else {
      scroller.stop(nameElem);
    }
  });

  onCleanup(() => scroller.stop.bind(scroller));
  onError(() => scroller.stop.bind(scroller));

  function handleProfileMinClick(event: MouseEvent) {
    setActiveOverlay("UserControls");
  }

  return (
    <Show when={getUserData()} fallback={<div />}>
      <button onClick={handleProfileMinClick} class="p-1 max-w-[7.5rem] flex items-center text-xs transition-colors hover:bg-[#fff1] rounded gap-1" onpointerenter={() => setShouldScroll(true)} onpointerleave={() => setShouldScroll(false)}>
        <div>
          <Show when={avatar} fallback={DiscoAvatar({})}>
            <img src={avatar} alt="Your profile avatar" />
          </Show>
        </div>
        <div class="flex flex-col text-left leading-[14px]">
          <p ref={nameElem} class="break-keep whitespace-nowrap text-white font-bold w-20 overflow-hidden pr-1">
            {getUserData().name}
          </p>
          <p class="w-fit">{"#1337"}</p>
        </div>
      </button>
    </Show>
  );
};

export default UserProfileMin;
