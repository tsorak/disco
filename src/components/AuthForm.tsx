import { useNavigate } from "@solidjs/router";
import { Loader2, Check } from "lucide-solid";
import { Component, Show, createEffect, createSignal, JSX } from "solid-js";
import { createServerAction$ } from "solid-start/server";

import { API_URL } from "~/routes";

const AuthForm: Component<{}> = (props) => {
  const [formMode, setFormMode] = createSignal<"LOGIN" | "SIGNUP">("LOGIN");
  const [authentication, { Form }] = createServerAction$(async (form: FormData, { fetch, request }) => {
    const email = form.get("disco_email") as string;
    const password = form.get("disco_password") as string;
    const authType = form.get("disco_authType") as "LOGIN" | "SIGNUP";

    console.log(email, password, authType);
    const resp = await fetch(API_URL + "/" + authType.toLowerCase(), {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const cookies: string = resp.headers.get("set-cookie");

    if (resp.status !== 200) throw new Error("Bad request");
    return new Response(null, { status: 200, headers: { "set-cookie": cookies } });
  });

  const handleFormSwitch = () => {
    setFormMode((prev) => (prev === "LOGIN" ? "SIGNUP" : "LOGIN"));
  };

  createEffect(() => {
    if (authentication.result) {
      console.log("authentication.result", authentication.result);
      useNavigate()("./"); //TODO: Trigger a state refetch
    }
  });

  return (
    <div class="absolute h-screen w-screen z-50 flex justify-center items-center bg-[#0009] text-lg select-none">
      <Form class="dark:bg-dc-foreground-bg-dark text-dc-primary-text-dark flex flex-col justify-center p-6 rounded gap-3">
        {formMode() === "LOGIN" ? (
          <h1 class="text-2xl text-center">Login</h1>
        ) : (
          <>
            <h1 class="text-2xl text-center">Sign up</h1>
          </>
        )}
        <FormInput type="email" name="disco_email" placeholder="Email" />
        {/* <FormInput type="text" name="disco_username" /> */}
        <FormInput type="password" name="disco_password" placeholder="Password" />
        <input type="hidden" name="disco_authType" value={formMode()} />
        <button class={`transition-colors bg-blue-800 hover:bg-blue-600 flex justify-center p-1 rounded-sm`} type="submit">
          <Show when={authentication.result}>
            <Check size={"1.55em"} />
          </Show>
          <Show when={authentication.error}>Invalid input</Show>
          <Show when={authentication.pending}>
            <Loader2 class="animate-spin" size={"1.55em"} />
          </Show>
          <Show when={!authentication.error && !authentication.result && !authentication.pending}>Submit</Show>
        </button>
        <button onclick={handleFormSwitch} class="text-dc-link-text self-end text-xs hover:underline placeholder-shown:text-white" type="button">
          {formMode() === "LOGIN" ? "Need an account?" : "Already have an account?"}
        </button>
      </Form>
    </div>
  );
};

const FormInput: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} class="bg-dc-interactable-bg-dark focus:outline-none py-1 px-2 rounded-sm" />;
};

export default AuthForm;
