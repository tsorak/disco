import { Accessor, Component } from "solid-js";
import type { tMember } from "~/utils/types";

// interface Reaction {
//   emote: string;
//   count: number;
// }

// interface Message {
//   id?: string;
//   sender:
//     | {
//         uuid?: string;
//         name?: string;
//       }
//     | {
//         MembersAccessor?: Accessor<{ uuid: string; name: string; avatar?: string }[]>;
//         senderUUID?: string;
//       };
//   reactions?: Reaction[];
//   date?: string;
//   content?: string;
// }

// export const Message: Component<{ uuid: string; sender: { uuid: string; membersAccessor: Accessor<tMember[]> }; content: string }> = (props) => {
export const Message: Component<{ uuid: string; sender: string; content: string; membersAccessor: Accessor<tMember[]> }> = (props) => {
  // const { uuid, sender, reactions, date, content } = props;
  const { uuid, sender, content, membersAccessor } = props;

  const getName = () => membersAccessor()?.find((member) => member.uuid === sender).name;

  return (
    <li onclick={() => console.log(uuid)}>
      <div class="message transition-colors hover:bg-dc-msg-selected-dark px-6 mt-[2px] pb-[2px]">
        <h3 class="messageHeader dark:text-dc-primary-text-dark">
          <span class="text-xs dark:text-dc-placeholder-text-dark font-light cursor-default">{null || "13:37"}</span>
          <span class="ml-1">{getName() ?? "DiscoUser"}</span>
        </h3>
        <div class="messageContent px-12 dark:text-[#ccc]">{content}</div>
        {/* <div class="messageReactions px-12 flex gap-2">
          {reactions?.map((reaction) => (
            <button class="px-1 py-[1px] bg-[#06f2] border-[1px] border-[#06f5] rounded-md">
              {reaction.emote} {reaction.count}
            </button>
          ))}
        </div> */}
      </div>
    </li>
  );
};

export default Message;
