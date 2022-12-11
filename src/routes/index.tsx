import { PlusCircle, Gift, Sticker, Smile, HelpCircle, Inbox, Users, UserPlus, Pin, Video, PhoneCall, User, Phone } from "lucide-solid";

import { json, parseCookie, useServerContext } from "solid-start";

import { Component, onMount, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import Message from "../components/Message";
import ChannelTitle from "../components/ChannelTitle";
import { clientSocket } from "~/communication/websocket";

const App: Component = () => {
  const [activeMessages, setActiveMessages] = createSignal([]);

  const serverContext = useServerContext();
  const cookie = () => parseCookie(isServer ? serverContext.request.headers.get("cookie") ?? "" : document.cookie);

  const loggedInUser = {
    username: "karots",
    uuid: "uuid-for-profile",
  };

  let scrollDiv: HTMLDivElement | undefined;
  let msgElem: HTMLInputElement;
  const websocket = clientSocket;
  onMount(() => {
    websocket.init(`${location.origin.replace("http", "ws").replace("3000", "8080")}`, cookie().discoToken);

    websocket.on("chat", (data) => {
      console.log("Incoming msg:", data);
      setActiveMessages([...activeMessages(), data]);
    });

    //ms
    createEffect(() => {
      console.log(websocket.ms.get());
    });

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
        <nav class="w-[72px] flex-none"></nav>
        <div class="flex-grow bg-dc-sidebar-bg-dark flex">
          <div class="sidebar w-60 flex flex-col flex-none">
            <nav class="privateChannels flex flex-col flex-grow h-0">
              <div class="flex h-12 border-b-[2px] dark:border-[#0002] box-content">
                <button class="m-[10px] bg-dc-serverbar-bg-dark flex-grow rounded text-sm p-1 px-[6px] text-left tracking-tight font-semibold" type="button">
                  Find or start a conversation
                </button>
              </div>
              <div class="overflow-y-auto">
                <ul>
                  <li class="m-2 p-3 bg-[#ffffff09] hover:bg-[#fff1] rounded">
                    <h1>Foo</h1>
                  </li>
                </ul>
              </div>
            </nav>
            <section class="panels">
              <div class="connectionInfo select-none text-white">
                {["CONNECTING", "RECONNECTING"].includes(websocket.phase.get()) && <h1 class="px-1 bg-yellow-600">{websocket.phase.get() === "CONNECTING" ? "Connecting" : "Reconnecting"}...</h1>}
                {websocket.phase.get() === "AUTHORISING" && <h1 class="px-1 bg-blue-600">Authorising...</h1>}
                {websocket.phase.get() === "CLOSED" && <h1 class="px-1 bg-red-700">Disconnected</h1>}
                {websocket.phase.get() === "CONNECTED" && <h1 class="px-1 bg-green-700">Connected</h1>}
              </div>
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
