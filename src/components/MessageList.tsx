import { Accessor, Component, For } from "solid-js";
import Message from "./Message";
import type { tMember, tMessage } from "~/utils/types";

const MessageList: Component<{ messagesAccessor?: Accessor<tMessage[]>; membersAccessor: Accessor<tMember[]> }> = (props) => {
  const { messagesAccessor, membersAccessor } = props;

  return (
    <For each={messagesAccessor()}>{(item) => <Message {...{ ...item, membersAccessor }} />}</For>
    // <>
    //   {messagesAccessor()?.map((message) => (
    //     <Message {...{ ...message, membersAccessor }} />
    //   ))}
    // </>
  );
};

export default MessageList;
