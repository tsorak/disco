import { Component } from "solid-js";
import { User } from "lucide-solid";

const Member: Component = (props: { name: string; avatar: string; uuid: string }) => {
  const { name, avatar, uuid } = props;

  const handleMemberClick = (e: MouseEvent) => {};

  const fetchUserData = (uuid: string) => {
    return { name, avatar };
  };
  return (
    <button onClick={handleMemberClick} class="flex p-2 mx-2 gap-2 dark:hover:bg-[rgba(79,84,92,0.4)] dark:hover:text-dc-primary-text-dark rounded">
      {avatar ? <img src={avatar} alt={`${name}'s profile picture`} /> : discoAvatar({})}
      <div class="self-center select-none">
        <p>{name}</p>
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
