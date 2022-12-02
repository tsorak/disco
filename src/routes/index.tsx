import { PlusCircle, Gift, Sticker, Smile, HelpCircle, Inbox, Users, UserPlus, Pin, Video, PhoneCall, User, Phone } from "lucide-solid";

import { json, parseCookie, useServerContext } from "solid-start";

import { Component, onMount, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import Message from "../components/Message";
import ChannelTitle from "../components/ChannelTitle";

const App: Component = () => {
  const [lastCloseMsg, setLastCloseMsg] = createSignal<{ reason: string; timeStamp: number }>({ reason: "", timeStamp: 0 });
  const [lastPing, setLastPing] = createSignal<string | number>("-");
  const [activeMessages, setActiveMessages] = createSignal([]);
  const [socketConnected, setSocketConnected] = createSignal(false);

  const serverContext = useServerContext();
  const cookie = () => parseCookie(isServer ? serverContext.request.headers.get("cookie") ?? "" : document.cookie);

  const loggedInUser = {
    username: "karots",
    uuid: "uuid-for-profile",
  };

  let scrollDiv: HTMLDivElement | undefined;

  let ping;
  let websocket: WebSocket | undefined;

  function sendWebSocketMessage(type, data) {
    websocket.send(JSON.stringify({ type, data }));
  }

  function initClientSocket(url: string): WebSocket {
    const socket = new WebSocket(url);

    socket.addEventListener("open", (event) => {
      // websocket.send({ type: "login", data: { msg, token: cookie().discoToken, target: "@me/åtister", sender: loggedInUser.uuid } }) ??????????????
      console.log("Socket Opened", event);
      sendWebSocketMessage("connect", { token: cookie().discoToken });
    });

    socket.addEventListener("message", (event) => {
      try {
        JSON.parse(event.data);
      } catch (e) {
        return;
      }
      const message = JSON.parse(event.data);

      if (message.type != "pong") console.log(message.data);

      switch (message.type) {
        case "connect":
          setSocketConnected(true);
          break;
        case "pong":
          setLastPing(Number(message.data.time) - ping);
          break;
        case "chat":
          setActiveMessages([...activeMessages(), message.data]);
        default:
          break;
      }
    });

    socket.addEventListener("close", (event) => {
      console.log("Socket Closed", event);
      const { reason } = event;
      const timeStamp = Math.round(event.timeStamp);

      setLastCloseMsg({ reason, timeStamp });
      setSocketConnected(false);
    });

    socket.addEventListener("error", (event) => {
      console.log("Socket Errored :>> ", event);
    });

    return socket;
  }

  onMount(() => {
    websocket = initClientSocket(`${location.origin.replace("http", "ws").replace("3000", "8080")}`);
    console.log(websocket);

    //closeReason
    createEffect(() => {
      lastCloseMsg();
      console.log("Close reason:", lastCloseMsg());
    });

    //Reconnect
    createEffect(() => {
      // if (socketConnected() || lastCloseMsg().reason === "Invalid token") return;
      if (socketConnected() || lastCloseMsg().reason === "Invalid token") return;

      let interval = setInterval(() => {
        console.log("Attempting to reconnect...");

        try {
          websocket = initClientSocket(`${location.origin.replace("http", "ws").replace("3000", "8080")}`);
        } catch (e) {}
      }, 5000);

      onCleanup(() => {
        clearInterval(interval);
      });
    });

    // client ping <-> server pong
    createEffect(() => {
      if (!socketConnected()) return;

      let interval = setInterval(() => {
        try {
          const id = crypto.randomUUID();
          sendWebSocketMessage("ping", { id, lastMS: lastPing() });
          ping = Date.now();
        } catch (e) {}
      }, 1000);

      onCleanup(() => {
        clearInterval(interval);
      });
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
    const msg = event.target.msg.value || null;
    if (!msg) return;

    console.log("MSG:", msg);

    websocket.send(JSON.stringify({ type: "chat", data: { msg, target: "@me/åtister", sender: loggedInUser.uuid, token: cookie().discoToken } }));

    event.target.msg.value = null;
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
                    <h1>xDD</h1>
                  </li>
                </ul>
              </div>
            </nav>
            <section class="panels">
              <div class="connectionInfo select-none text-white">
                {socketConnected() && (
                  <h1 class="px-1 bg-green-700">
                    Connected <span>{lastPing()}ms</span>
                  </h1>
                )}
                {!socketConnected() && <h1 class="px-1 bg-red-800">Disconnected</h1>}
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
                    <input class="bg-transparent text-dc-primary-text-dark focus:outline-none w-full min-w-[1rem]" type="text" name="msg" id="msg" autocomplete="off" spellcheck={false} />
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
