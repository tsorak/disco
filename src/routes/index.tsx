import { PlusCircle, Gift, Sticker, Smile, HelpCircle, Inbox, Users, UserPlus, Pin, Video, PhoneCall, User, Phone, Home, Cog, Headphones, Mic } from "lucide-solid";
import server$ from "solid-start/server";

import { json, parseCookie, useServerContext } from "solid-start";

import { Component, onMount, createSignal, createEffect, onCleanup, onError, createResource } from "solid-js";
import { isServer } from "solid-js/web";
import { A, useLocation, useRouteData } from "@solidjs/router";

import { clientSocket } from "~/communication/websocket";
import ChannelTitle from "~/components/ChannelTitle";
import ConnectionInfo from "~/components/ConnectionInfo";
import ChannelList from "~/components/ChannelList";
import AuthForm from "~/components/AuthForm";
import MemberList from "~/components/MemberList";
import MessageList from "~/components/MessageList";
import UserProfileMin from "~/components/UserProfileMin";
import { Overlay } from "~/components/Overlay";

import { tUserData } from "~/utils/types";

export const API_URL = "http://127.0.0.1:8080";

export interface ChannelCollection {
  path: string;
  name: string;
}

export function AppData() {
  const [path, setPath] = createSignal<string>(useLocation().pathname);
  createEffect(() => {
    setPath(useLocation().pathname);
  });
  //using useLocation as the Accessor does not work reactivly
  const [discoData] = createResource(path, async (path, c) => {
    const cookie = document.cookie; //TODO: isServer if ssr

    const proxyFetch = server$(async (url: string, cookie: string) => {
      console.log(`Fetching '${url}' using '${cookie}'`);

      let res;
      try {
        res = await fetch(url, {
          headers: {
            cookie,
          },
        });
        if (res.status >= 400) {
          throw new Error(res.statusText ?? "ERROR");
        }
        return await res.json();
      } catch (error) {
        return { status: await res?.status, error: error.message };
      }
    });

    return await proxyFetch("http://localhost:8080" + path, cookie);
  });

  return [discoData];
}

const App: Component = () => {
  const rData = useRouteData<typeof AppData>();
  const [discoData] = rData;

  createEffect(() => {
    if (!discoData.loading) {
      console.error(discoData());

      const { channelCollection, channel, userData, requestedPaths, status } = discoData();

      state.channelCollection[1](channelCollection);
      state.channel.name[1](channel?.name);
      state.channel.messages[1](channel?.messages);
      state.channel.members[1](channel?.members);
      state.userData[1](userData);
      state.activeChannel[1](requestedPaths?.join("/") ?? "");

      state.displayAuthForm[1](status && status === 403);
    }
  });

  //
  //
  //

  // const [state, setState] = createSignal({ channelCollection: [], channel: {}, userData: {} }, { equals: false });
  type ChannelMember = {
    uuid: string;
    name: string;
    avatar?: string;
  };
  type Channel = {
    name: string;
    messages: any[];
    members: ChannelMember[];
  };

  const state = {
    channelCollection: createSignal<ChannelCollection[]>([], {
      // equals(prev: [], next: []) {
      //   return prev.length === (next?.length ?? 0);
      // },
    }),
    channel: {
      name: createSignal<Channel["name"] | undefined>(undefined),
      messages: createSignal<Channel["messages"] | undefined>(undefined),
      members: createSignal<Channel["members"] | undefined>(undefined, { equals: false }),
    },
    userData: createSignal<tUserData>(undefined),
    activeChannel: createSignal<string>(""),
    displayAuthForm: createSignal<boolean>(false),
  };

  const cookie = () => parseCookie(isServer ? useServerContext().request.headers.get("cookie") ?? "" : document.cookie);

  let scrollDiv: HTMLDivElement | undefined;
  let msgElem: HTMLInputElement;
  const websocket = clientSocket;
  onMount(() => {
    websocket.init(`${location.origin.replace("http", "ws").replace("5173", "8080")}`, cookie().discoToken);

    websocket.on("chat", (data) => {
      console.log("Incoming msg:", data);
      // setActiveMessages([...activeMessages(), data]);
      if (data.reciever === state.activeChannel[0]().split("/")[1]) {
        state.channel.messages[1]((prev) => {
          //TODO:
          return [...prev, data];
        });
      } //TODO: Else notification bubble
    });

    //phase
    createEffect(() => {
      console.log(`[%cPHASE%c] ${websocket.phase.get()}`, "color: #0cf", "color: initial");
    });

    createEffect(() => {
      console.log("%cchannelCollection:", "background: #f00");
      console.log(state.channelCollection[0]());
    });

    createEffect(() => {
      console.log("%cchannel:", "background: #ff0");
      const channel = { name: state.channel.name[0](), messages: state.channel.messages[0](), members: state.channel.members[0]() };
      console.log(channel);
    });

    createEffect(() => {
      console.log("%cuserData:", "background: #f0f");
      console.log(state.userData[0]());
    });

    // Test state.channel.members dependency refreshing
    // setTimeout(() => {
    //   state.channel.members[1]((prev) => {
    //     const baj = prev;

    //     baj[0].name = "New Name";

    //     console.log(baj);

    //     return baj;
    //   });
    // }, 1000);

    createEffect(() => {
      console.log("%cactiveChannel:", "background: #0f0");
      console.log(state.activeChannel[0]());
    });

    //ms
    // createEffect(() => {
    //   console.log(websocket.ms.get());
    // });

    //Autoscroll
    createEffect(() => {
      state.channel.messages[0]()?.length;
      scrollDiv.scrollTop = scrollDiv.scrollHeight - scrollDiv.clientHeight;
    });

    onCleanup(() => {
      websocket.close();
    });
    onError(() => {
      websocket.close();
    });
  });

  const msgSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (websocket.phase.get() !== "CONNECTED") return;

    const data = new FormData(event.target);

    const msg = data.get("msg");
    if (!msg) return;

    const target = state.activeChannel[0]().split("/");

    if (!target[1]) return;

    console.log(`Sending: '${msg}' to ${state.activeChannel[0]()}`);
    websocket.emit("chat", { msg, target: state.activeChannel[0](), token: cookie().discoToken });
    msgElem.value = null;
  };

  //TODO: make AuthForm apart of Overlay
  return (
    <div id="App" class="relative">
      <Overlay state={state} />
      {state.displayAuthForm[0]() ? <AuthForm /> : null}
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
                <ChannelList channels={state.channelCollection[0]} activeCollection={state.activeChannel[0]} />
              </div>
            </nav>
            <section class="panels">
              <ConnectionInfo connectionState={websocket.phase.get} ms={websocket.ms.get} reconnect={() => websocket.connect.bind(websocket)("", cookie().discoToken)} closeReason={websocket.closeReason.get} />
              <div class="profile h-[52px] dark:bg-dc-profile-bg-dark flex justify-between items-center p-1.5">
                <UserProfileMin getUserData={state.userData[0]} />
                <div class="flex">
                  <button class="grayEmoji p-1.5 transition-colors hover:bg-[#fff1] rounded-md">
                    <Mic size={"1.3rem"} />
                  </button>
                  <button class="grayEmoji p-1.5 transition-colors hover:bg-[#fff1] rounded-md">
                    <Headphones size={"1.3rem"} />
                  </button>
                  <button class="grayEmoji p-1.5 transition-colors hover:bg-[#fff1] rounded-md">
                    <Cog size={"1.3rem"} />
                  </button>
                </div>
              </div>
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
                      <MessageList membersAccessor={state.channel.members[0]} messagesAccessor={state.channel.messages[0]} />
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
              <div class="members w-60 dark:bg-dc-sidebar-bg-dark flex-none flex flex-col py-2 gap-1">
                <MemberList membersAccessor={state.channel.members[0]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
