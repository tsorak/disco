import { json, parseCookie, useServerContext } from "solid-start";

import { Component, onMount, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import Message from "../components/Message";
import ChannelTitle from "../components/ChannelTitle";

const App: Component = () => {
    const [lastPing, setLastPing] = createSignal(null);

    let ping;
    let websocket: WebSocket | undefined;

    createEffect(() => {
        // console.log(fetch(`${location.origin}/api/socket`));

        websocket = new WebSocket(`${location.origin.replace("http", "ws").replace("3000", "8080")}`);
        console.log(websocket);

        websocket.addEventListener("message", (event) => {
            try {
                JSON.parse(event.data);
            } catch (e) {
                return;
            }
            const message = JSON.parse(event.data);
            switch (message.type) {
                case "pong":
                    setLastPing(Number(message.data.time) - ping);
                    break;
                default:
                    console.log(message);
                    break;
            }
        });

        function sendWebSocketMessage(type, data) {
            // console.log(type, data);
            websocket.send(JSON.stringify({ type, data }));
        }

        websocket.addEventListener("close", (event) => {
            console.log(event);
        });

        // client ping <-> server pong
        let interval = setInterval(() => {
            try {
                const id = crypto.randomUUID();
                sendWebSocketMessage("ping", { id, lastMS: lastPing() });
                ping = Date.now();
            } catch (e) {}
        }, 1000);

        onCleanup(() => {
            clearInterval(interval);
            websocket.close();
        });
    });

    //handlers
    const msgSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        const msg = event.target.msg.value || null;
        if (!msg) return;

        console.log("MSG:", msg);

        const serverContext = useServerContext();
        const cookie = () => parseCookie(isServer ? serverContext.request.headers.get("cookie") ?? "" : document.cookie);

        websocket.send(JSON.stringify({ type: "chat", data: { msg, token: cookie().discoToken, target: "@me/åtister" } }));

        event.target.msg.value = null;
    };

    return (
        <>
            <div class="flex h-screen dark:bg-dc-serverbar-bg-dark text-dc-sidebar-text-dark">
                <nav class="w-[72px]"></nav>
                <div class="flex-grow bg-dc-sidebar-bg-dark flex">
                    <div class="sidebar w-60 flex flex-col">
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
                            <div class="connectionInfo">
                                <h1>{lastPing}</h1>
                            </div>
                            <div class="profile h-[52px] dark:bg-dc-profile-bg-dark"></div>
                        </section>
                    </div>
                    <div class="content dark:bg-dc-foreground-bg-dark flex-grow flex flex-col">
                        <section class="chat-header flex h-12 justify-between px-4 border-b-[2px] dark:border-[#0002] box-content">
                            <ChannelTitle />
                            <div class="toolbar flex items-center gap-4">
                                <button class="grayEmoji">📞</button>
                                <button class="grayEmoji">🎥</button>
                                <button class="grayEmoji">📌</button>
                                <button class="grayEmoji">👤</button>
                                <button class="grayEmoji">👥</button>
                                <input class="bg-dc-serverbar-bg-dark rounded text-sm p-1 px-[6px] text-left tracking-tight font-normal w-36 focus:outline-none" type="text" placeholder="Search" />
                                <button class="grayEmoji">📥</button>
                                <button class="w-6 h-6 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold">?</button>
                            </div>
                        </section>
                        <div class="chatarea flex-grow flex">
                            <div class="chatContent flex-grow flex flex-col">
                                <main class="chat flex-grow overflow-y-auto">
                                    <div class="scrollContent w-full">
                                        <ol class="list-none">
                                            <Message id={"1"} sender={{ id: undefined, name: undefined }} reactions={[{ emote: "😐", count: 1 }]} date={undefined} content={"Hello World!"} />
                                        </ol>
                                    </div>
                                </main>
                                <form class="chatInput h-[44px] mb-6 mx-4 dark:bg-dc-msgInput-bg-dark rounded flex" onSubmit={msgSubmit}>
                                    <div class="flex items-center px-3">
                                        <button class="w-7 h-7 text-[22px] dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold" type={"button"}>
                                            <span class="absolute -translate-x-[7.5px] -translate-y-[19px]">+</span>
                                        </button>
                                    </div>
                                    <div class="flex-grow flex">
                                        <input class="flex-grow bg-transparent text-dc-primary-text-dark focus:outline-none" type="text" name="msg" id="msg" autocomplete="off" spellcheck={false} />
                                    </div>
                                    <div class="flex items-center gap-3 text-lg px-3">
                                        <button class="grayEmoji">🎁</button>
                                        <button class="text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded font-extrabold">GIF</button>
                                        <button class="grayEmoji">📁</button>
                                        <button class="w-6 h-6 text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-extrabold">
                                            <span class="absolute rotate-90 -translate-x-1 -translate-y-2">{`: )`}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div class="members w-60 dark:bg-dc-sidebar-bg-dark"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
