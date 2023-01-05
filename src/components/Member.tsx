import { Accessor, Component } from "solid-js";
import { User } from "lucide-solid";
import { tMember } from "~/utils/types";

const Member: Component<{ name: string; avatar?: string; uuid: string; membersAccessor: Accessor<tMember[]> }> = (props) => {
  const { uuid, name, avatar, membersAccessor } = props;

  const handleMemberClick = (e: MouseEvent) => {};

  const fetchUserData = (uuid: string) => {
    return { name: getMember().name, avatar };
  };

  const getMember = () => membersAccessor().find((member) => member.uuid === uuid);

  console.warn("RENDERED");

  return (
    <button onClick={handleMemberClick} class="flex p-2 mx-2 gap-2 dark:hover:bg-[rgba(79,84,92,0.4)] dark:hover:text-dc-primary-text-dark rounded">
      {avatar ? <img src={avatar} alt={`${getMember().name}'s profile picture`} /> : discoAvatar({})}
      <div class="self-center select-none">
        <p>{getMember().name}</p>
      </div>
    </button>
  );
};

const discoAvatar: Component = (props: {}) => {
  const rndColor = `hsl(${Math.round(Math.random() * 360)},30%,50%)`;
  return (
    <div style={{ background: `${rndColor}` }} class="w-8 h-8 flex justify-center items-center rounded-full">
      <User color="#fff" />
    </div>
  );
};

export default Member;
