import { Camera, LogOut } from "lucide-solid";

import DiscoAvatar from "./DiscoAvatar";

import { Accessor, Component, JSX } from "solid-js";
import { tUserData } from "~/utils/types";
import { createServerAction$, redirect } from "solid-start/server";
import { setActiveOverlay } from "./Overlay";
import { refetchRouteData } from "solid-start";

const UserControls: Component<{ getUserData: Accessor<tUserData> }> = (props) => {
  const { getUserData } = props;

  const [, logout] = createServerAction$(async (_, { request }) => redirect("./", { headers: { "Set-Cookie": `discoToken=; Expires=${new Date(0).toUTCString()}; Path=/` } }));

  const handleLogoutClick = async (e: MouseEvent) => {
    setActiveOverlay("");
    await logout();
    refetchRouteData("discoData");
  };

  return (
    <div class="absolute flex flex-col dark:text-dc-sidebar-text-dark dark:bg-[#292b2f] w-80 left-16 bottom-16 p-4 rounded-md animate-fadein">
      <div class="px-2 py-4">
        <button class="relative rounded-full overflow-hidden group">
          <div class="absolute text-white w-full h-full flex justify-center items-center bg-[#0008] z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera />
          </div>
          <DiscoAvatar size={6} />
        </button>
      </div>
      <div class="flex flex-col dark:bg-[#18191c] p-2 rounded-md">
        <p class="text-dc-primary-text-dark text-lg">
          {getUserData()?.name}
          <span class="text-dc-placeholder-text-dark">#1337</span>
        </p>
        {Divider()}
        <p class="font-bold text-sm dark:text-dc-primary-text-dark">DISCO MEMBER SINCE</p>
        <p class="dark:text-dc-placeholder-text-dark">2022</p>
        {Divider()}
        <Button>Online</Button>
        <Button>Set Custom Status</Button>
        {Divider()}
        <Button class="group" onClick={handleLogoutClick}>
          <LogOut size={"19px"} class="group-hover:text-red-600" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

const Button: Component<{ children: JSX.Element; class?: string; onClick?: (e: MouseEvent) => unknown }> = (props) => {
  return (
    <button onClick={props.onClick} class={`text-left transition-colors hover:bg-[#fff1] dark:hover:text-dc-primary-text-dark p-1 rounded flex items-center gap-2 ${props.class ?? ""}`}>
      {props.children}
    </button>
  );
};

const Divider = () => {
  return <div class="h-px w-full bg-[#292b2f] my-2" />;
};

export default UserControls;
