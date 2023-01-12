import { Accessor, Component } from "solid-js";
import { User } from "lucide-solid";
import { tMember } from "~/utils/types";
import DiscoAvatar from "./DiscoAvatar";

const Member: Component<{ name: string; avatar?: string; uuid: string; membersAccessor: Accessor<tMember[]> }> = (props) => {
  const { uuid, name, avatar, membersAccessor } = props;

  const handleMemberClick = (e: MouseEvent) => {};

  const fetchUserData = (uuid: string) => {
    return { name: getMember().name, avatar };
  };

  const getMember = () => membersAccessor().find((member) => member.uuid === uuid);

  console.warn("RENDERED");

  return (
    <button onClick={handleMemberClick} class="flex p-2 mx-2 gap-2 dark:hover:bg-[rgba(79,84,92,0.4)] dark:hover:text-dc-primary-text-dark rounded transition-colors">
      {avatar ? <img src={avatar} alt={`${getMember().name}'s profile picture`} /> : DiscoAvatar({})}
      <div class="self-center select-none">
        <p>{getMember().name}</p>
      </div>
    </button>
  );
};

export default Member;
