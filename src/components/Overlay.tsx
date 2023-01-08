import { Component, createSignal, JSX, Show, Signal } from "solid-js";
import { tUserData } from "~/utils/types";

import UserControls from "./UserControls";

const [activeOverlay, setActiveOverlay] = createSignal<string>("");

const Overlay: Component<{ state: { userData: Signal<tUserData> } }> = (props) => {
  const overlayIs = (overlayName: string) => activeOverlay() === overlayName;

  return (
    <>
      <Show when={overlayIs("UserControls")}>
        <Fullscreen>
          <UserControls getUserData={props.state?.userData[0]} />
        </Fullscreen>
      </Show>
    </>
  );
};

const Fullscreen: Component<{ children: JSX.Element }> = (props) => {
  const handleCloseOverlay = (e: MouseEvent) => {
    const shouldClose = e.target.id === "discoOverlayElem";
    shouldClose && setActiveOverlay("");
  };

  return (
    <div id="discoOverlayElem" class="absolute w-screen h-screen z-20" onClick={handleCloseOverlay}>
      {props.children}
    </div>
  );
};

export { Overlay, activeOverlay, setActiveOverlay };
