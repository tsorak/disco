import { User } from "lucide-solid";
import { Component } from "solid-js";

const DiscoAvatar: Component<{ color?: string; size?: number }> = (props) => {
  const color = props.color ?? `hsl(${Math.round(Math.random() * 360)},30%,50%)`;

  return (
    <div style={{ background: `${color}` }} class={`p-${props.size ? props.size : 1} flex justify-center items-center rounded-full`}>
      <User color="#fff" />
    </div>
  );
};

export default DiscoAvatar;
