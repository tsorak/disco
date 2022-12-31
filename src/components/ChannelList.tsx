import { A } from "@solidjs/router";
import { Component } from "solid-js";

const ChannelList: Component = (props) => {
  const channels = props.channels;

  return (
    <ul class="flex flex-col justify-center gap-2 py-2">
      {channels()?.length
        ? channels().map((channel) => (
            <li class="mx-2 flex rounded overflow-hidden h-[44px]">
              <A href={`/app/${channel.path}`} class="p-2 flex-grow dark:hover:bg-[rgba(79,84,92,0.4)] flex items-center" activeClass="channel-selected">
                {channel.name ?? channel.path}
              </A>
            </li>
          ))
        : null}
    </ul>
  );
};

export default ChannelList;
