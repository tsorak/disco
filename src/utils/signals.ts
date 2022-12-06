import { Accessor, createSignal, Setter } from "solid-js";

const objectSignal = (initialValue: unknown): { get: Accessor<any>; set: Setter<any> } => {
  const [get, set] = createSignal(initialValue);
  return { get, set };
};
// Object.fromEntries(createSignal(initialValue).map((fn,i) => [i === 0 ? "get" : "set", fn]))

export { objectSignal };
