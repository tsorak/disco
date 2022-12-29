import { PlusCircle, Gift, Sticker, Smile, HelpCircle, Inbox, Users, UserPlus, Pin, Video, PhoneCall, User, Phone, Home } from "lucide-solid";

import { json, parseCookie, useServerContext } from "solid-start";
import server$ from "solid-start/server";

import { Component, onMount, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { A, useLocation } from "@solidjs/router";

import { clientSocket } from "~/communication/websocket";
import Message from "~/components/Message";
import ChannelTitle from "~/components/ChannelTitle";
import ConnectionInfo from "~/components/ConnectionInfo";
import ChannelList from "~/components/ChannelList";

import { buildSignal } from "~/utils/signals";

const API_URL = "http://localhost:8080";

const App: Component = () => {
  // const [state, setState] = createSignal({ channelCollection: [], channel: {}, userData: {} }, { equals: false });
  const state = {
    channelCollection: buildSignal([], {
      equals(prev: [], next: []) {
        return prev.length === (next?.length ?? 0);
      },
    }),
  };
  const [activeMessages, setActiveMessages] = createSignal([]);

  const cookie = () => parseCookie(isServer ? useServerContext().request.headers.get("cookie") ?? "" : document.cookie);

  const loggedInUser = {
    username: "karots",
    uuid: "uuid-for-profile",
  };

  const getUserdata = () => Object.assign(loggedInUser, { token: cookie().discoToken });

  let scrollDiv: HTMLDivElement | undefined;
  let msgElem: HTMLInputElement;
  const websocket = clientSocket;
  onMount(() => {
    websocket.init(`${location.origin.replace("http", "ws").replace("3000", "8080")}`, cookie().discoToken);

    websocket.on("chat", (data) => {
      console.log("Incoming msg:", data);
      setActiveMessages([...activeMessages(), data]);
    });

    //isRouting
    createEffect(async () => {
      const res = server$(async (path: string, token: string) => {
        // console.log(
        //   `
        //   Client is requesting the following channel: ${path}
        //   As: ${JSON.stringify(user)}
        //   `
        // );

        const headers = new Headers();
        headers.set("cookie", `discoToken=${token}`);

        try {
          const apiRes = await fetch(API_URL + path, {
            headers,
          });
          const json = await apiRes.json();
          console.log(json); // {requestedPaths: string[], userData: {name, friendcode, avatar}, channelCollection: channel{name:""}[], channel: {name, members[], messages[]}}
          return json;
        } catch (error) {
          return { path, error };
        }
      });
      const path = useLocation().pathname;
      const data = await res(path, cookie().discoToken);

      const { channelCollection } = data;

      state.channelCollection.set(channelCollection);

      console.log("%cGot the following channel data:", "color: #0f0", data);
    });

    //phase
    createEffect(() => {
      console.log(`[%cPHASE%c] ${websocket.phase.get()}`, "color: #0cf", "color: initial");
    });

    createEffect(() => {
      console.log("%cchannelCollection:", "background: #f00");
      console.log(state.channelCollection.get());
    });

    //ms
    // createEffect(() => {
    //   console.log(websocket.ms.get());
    // });

    //Autoscroll
    createEffect(() => {
      activeMessages().length;
      scrollDiv.scrollTop = scrollDiv.scrollHeight - scrollDiv.clientHeight;
    });

    onCleanup(() => {
      websocket.close();
    });
  });

  const msgSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (websocket.phase.get() !== "CONNECTED") return;

    const data = new FormData(event.target);

    const msg = data.get("msg");
    if (!msg) return;

    console.log("MSG:", msg);
    websocket.emit("chat", { msg, target: "@me/åtister", sender: loggedInUser.uuid, token: cookie().discoToken });
    msgElem.value = null;
  };

  return (
    <>
      <div class="flex h-screen dark:bg-dc-serverbar-bg-dark text-dc-sidebar-text-dark">
        <nav class="w-[72px] flex-none flex flex-col gap-2 py-2">
          <A href="/app/@me" class="mx-3 rounded-full w-12 h-12 flex items-center p-0.5 relative z-10 overflow-hidden bg-dc-foreground-bg-dark text-white" activeClass="channel-collection-selected">
            <div class="p-2 flex-grow bg-dc-foreground-bg-dark rounded-full h-full">
              <Home class="w-full h-full" />
            </div>
          </A>
          <div class="splitter h-0.5 mx-5 bg-dc-foreground-bg-dark"></div>
        </nav>
        <div class="flex-grow bg-dc-sidebar-bg-dark flex">
          <div class="sidebar w-60 flex flex-col flex-none">
            <nav class="privateChannels flex flex-col flex-grow h-0">
              <div class="flex h-12 border-b-[2px] dark:border-[#0002] box-content">
                <button class="m-[10px] bg-dc-serverbar-bg-dark flex-grow rounded text-sm p-1 px-[6px] text-left tracking-tight font-semibold" type="button">
                  Find or start a conversation
                </button>
              </div>
              <div class="overflow-y-auto flex-grow">
                <ChannelList channels={state.channelCollection.get} />
              </div>
            </nav>
            <section class="panels">
              <ConnectionInfo connectionState={websocket.phase.get} ms={websocket.ms.get} reconnect={() => websocket.connect.bind(websocket)("", cookie().discoToken)} closeReason={websocket.closeReason.get} />
              <div class="profile h-[52px] dark:bg-dc-profile-bg-dark"></div>
            </section>
          </div>
          <div class="content dark:bg-dc-foreground-bg-dark flex-grow flex flex-col">
            <section class="chat-header flex h-12 justify-between px-4 border-b-[2px] dark:border-[#0002] box-content flex-none">
              <ChannelTitle />
              <div class="toolbar flex items-center gap-4">
                <button class="grayEmoji">
                  <PhoneCall />
                </button>
                <button class="grayEmoji">
                  <Video />
                </button>
                <button class="grayEmoji">
                  <Pin />
                </button>
                <button class="grayEmoji">
                  <User />
                </button>
                <button class="grayEmoji">
                  <Users />
                </button>
                <input class="bg-dc-serverbar-bg-dark rounded text-sm p-1 px-[6px] text-left tracking-tight font-normal w-36 focus:outline-none" type="text" placeholder="Search" />
                <button class="grayEmoji">
                  <Inbox />
                </button>
                {/* <button class="w-6 h-6 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold">?</button> */}
                <button class="grayEmoji">
                  <HelpCircle />
                </button>
              </div>
            </section>
            <div class="chatarea flex-grow flex h-0">
              <div class="chatContent flex flex-col flex-grow">
                <main class="chat flex-grow h-0 overflow-hidden">
                  <div class="scrollContent h-full overflow-y-auto" ref={scrollDiv}>
                    <ol class="list-none flex flex-col break-all">
                      {/* <Message id={"1"} sender={{ id: undefined, name: undefined }} reactions={[{ emote: "😐", count: 1 }]} date={undefined} content={"Hello World!"} />
                      <Message content={"Hello World!"} /> */}
                      {activeMessages().map((chatEntry) => (
                        <Message content={chatEntry.msg} sender={{ name: chatEntry.sender.name }} />
                      ))}
                      <div class="spacer h-6"></div>
                    </ol>
                  </div>
                </main>
                <form class="chatInput basis-11 mb-6 mx-4 dark:bg-dc-msgInput-bg-dark rounded flex" onSubmit={msgSubmit}>
                  <div class="flex items-center px-3">
                    {/* <button class="w-7 h-7 text-[22px] dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold" type={"button"}>
                      <span class="absolute -translate-x-[7.5px] -translate-y-[19px]">+</span>
                    </button> */}
                    <button class="grayEmoji">
                      <PlusCircle />
                    </button>
                  </div>
                  <div class="flex-grow flex">
                    <input class="bg-transparent text-dc-primary-text-dark focus:outline-none w-full min-w-[1rem]" type="text" name="msg" id="msg" autocomplete="off" spellcheck={false} ref={msgElem} />
                  </div>
                  <div class="flex items-center gap-3 text-lg px-3">
                    <button class="grayEmoji">
                      <Gift />
                    </button>
                    <button class="text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded font-extrabold">GIF</button>
                    <button class="grayEmoji">
                      <Sticker />
                    </button>
                    {/* <button class="w-6 h-6 text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-extrabold">
                      <span class="absolute rotate-90 -translate-x-1 -translate-y-2">{`: )`}</span>
                    </button> */}
                    <button class="grayEmoji">
                      <Smile />
                    </button>
                  </div>
                </form>
              </div>
              <div class="members w-60 dark:bg-dc-sidebar-bg-dark flex-none"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
