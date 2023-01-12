import { A } from "@solidjs/router";
import { Users } from "lucide-solid";
import { Accessor, Component, For, Show } from "solid-js";

import type { ChannelCollection } from "~/routes";
import DiscoAvatar from "./DiscoAvatar";

const ChannelList: Component<{ channels: Accessor<ChannelCollection[]>; activeCollection: Accessor<string> }> = (props) => {
  const { channels, activeCollection } = props;

  const isDms = () => activeCollection().split("/")[0] === "@me";

  return (
    <div class="p-2 flex flex-col">
      <Show when={isDms()}>
        <button class="p-3 flex-grow dark:hover:bg-[rgba(79,84,92,0.4)] dark:hover:text-dc-primary-text-dark flex items-center transition-colors rounded gap-3 select-none">
          <Users />
          <span>Friends</span>
        </button>
        <p class="text-xs font-semibold dark:hover:text-dc-primary-text-dark transition-colors py-2 mt-3 mx-2 select-none">DIRECT MESSAGES</p>
      </Show>
      <ul class="flex flex-col justify-center gap-2">
        <For each={channels()}>
          {(channel) => (
            <li class="flex rounded overflow-hidden h-[44px]">
              <A href={`/app/${channel.path}`} class="p-2 flex-grow dark:hover:bg-[rgba(79,84,92,0.4)] dark:hover:text-dc-primary-text-dark flex items-center transition-colors gap-2 select-none" activeClass="channel-selected">
                <DiscoAvatar />
                <span>{channel.name ?? channel.path}</span>
              </A>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export default ChannelList;
