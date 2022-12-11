import { Accessor, createSignal, Setter } from "solid-js";
import type { SignalOptions } from "solid-js/types/reactive/signal";

const buildSignal = (initialValue: unknown, options?: SignalOptions<unknown>): { get: Accessor<any>; set: Setter<any> } => {
  const [get, set] = createSignal(initialValue, options);
  return { get, set };
};
// Object.fromEntries(createSignal(initialValue).map((fn,i) => [i === 0 ? "get" : "set", fn]))

export { buildSignal };
