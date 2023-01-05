import { Accessor, Component, For } from "solid-js";
import Member from "~/components/Member";
import type { tMember } from "~/utils/types";

const MemberList: Component<{ membersAccessor?: Accessor<tMember[]> }> = (props) => {
  const { membersAccessor } = props;

  return (
    // <For each={membersAccessor()}>{(item, index) => <Member {...{ ...item, getName: () => membersAccessor()[index()].name }} />}</For>
    <For each={membersAccessor()}>{(item) => <Member {...{ ...item, membersAccessor }} />}</For>
    // <>
    //   {membersAccessor()?.map((member, index) => (
    //     <Member {...{ ...member, getName: () => membersAccessor()[index].name }} />
    //   ))}
    // </>
  );
};

export default MemberList;
