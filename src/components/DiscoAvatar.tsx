import { User } from "lucide-solid";
import { Component } from "solid-js";

const DiscoAvatar: Component<{ color?: string }> = (props) => {
  const color = props.color ?? `hsl(${Math.round(Math.random() * 360)},30%,50%)`;

  return (
    <div style={{ background: `${color}` }} class="w-8 h-8 flex justify-center items-center rounded-full">
      <User color="#fff" />
    </div>
  );
};

export default DiscoAvatar;
