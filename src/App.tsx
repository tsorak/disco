import { Component, onMount } from "solid-js";

const App: Component = () => {
	const chat = {
		title: "Åtister",
	};

	const inputHandler = (event) => {
		console.log(event.target.value);
	};

	const textInputSizeHandler = (event) => {
		const inputLength = event.target.value.length;
		console.log(inputLength);

		event.target.size = inputLength;
	};

	const msgSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		const msg = event.target.msg.value || null;
		if (!msg) return;

		console.log("MSG:", msg);

		fetch("http://localhost:8000/", {
			headers: {
				"content-type": "application/json",
			},
			credentials: "include",
			method: "POST",
			mode: "no-cors",
			body: JSON.stringify({ msg }),
		});
	};

	return (
		<>
			<div class="flex h-screen dark:bg-dc-serverbar-bg-dark text-dc-sidebar-text-dark">
				<nav class="w-[72px]"></nav>
				<div class="flex-grow bg-dc-sidebar-bg-dark flex">
					<div class="sidebar w-60 flex flex-col">
						<nav class="privateChannels flex flex-col flex-grow">
							<div class="flex h-12 border-b-[1px] dark:border-dc-serverbar-bg-dark">
								<button class="m-[10px] bg-dc-serverbar-bg-dark flex-grow rounded text-sm p-1 px-[6px] text-left tracking-tight font-semibold" type="button">
									Find or start a conversation
								</button>
							</div>
							<div>
								<ul>
									<li></li>
								</ul>
							</div>
						</nav>
						<section class="panels h-[52px] dark:bg-dc-profile-bg-dark"></section>
					</div>
					<div class="content dark:bg-dc-foreground-bg-dark flex-grow flex flex-col">
						<section class="chat-header flex h-12 justify-between px-4 border-b-[1px] dark:border-dc-serverbar-bg-dark">
							{/* <form class="title">
							</form> */}
							<form class="channel-name flex" onchange={inputHandler} onSubmit={(e) => e.preventDefault()}>
								<input class="bg-transparent text-dc-primary-text-dark focus:outline-none font-semibold text-lg leading-none flex-shrink-1" type="text" name="chat_title" id="chat_title" value={chat.title} size={chat.title.length / 2} oninput={textInputSizeHandler} autocomplete="off" spellcheck={false} />
							</form>
							<div class="toolbar flex items-center gap-4">
								<button class="grayEmoji">📞</button>
								<button class="grayEmoji">🎥</button>
								<button class="grayEmoji">📌</button>
								<button class="grayEmoji">👤</button>
								<button class="grayEmoji">👥</button>
								<input class="bg-dc-serverbar-bg-dark rounded text-sm p-1 px-[6px] text-left tracking-tight font-normal w-36 focus:outline-none" type="text" placeholder="Search" />
								<button class="grayEmoji">📥</button>
								<button class="w-6 h-6 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold">?</button>
							</div>
						</section>
						<div class="chatarea flex-grow flex">
							<div class="chatContent flex-grow flex flex-col">
								<main class="chat flex-grow"></main>
								<form class="chatInput h-[44px] mb-6 mx-4 dark:bg-dc-msgInput-bg-dark rounded flex" onSubmit={msgSubmit}>
									<div class="flex items-center px-3">
										<button class="w-7 h-7 text-[22px] dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-semibold" type={"button"}>
											<span class="absolute -translate-x-[7.5px] -translate-y-[19px]">+</span>
										</button>
									</div>
									<div class="flex-grow flex">
										<input class="flex-grow bg-transparent text-dc-primary-text-dark focus:outline-none" type="text" name="msg" id="msg" autocomplete="off" spellcheck={false} />
									</div>
									<div class="flex items-center gap-3 text-lg px-3">
										<button class="grayEmoji">🎁</button>
										<button class="text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded font-extrabold">GIF</button>
										<button class="grayEmoji">📁</button>
										<button class="w-6 h-6 text-xs py-[2px] px-1 dark:text-dc-foreground-bg-dark dark:bg-dc-placeholder-text-dark dark:hover:bg-dc-interactable-text-dark rounded-full font-extrabold">
											<span class="absolute rotate-90 -translate-x-1 -translate-y-2">{`: )`}</span>
										</button>
									</div>
								</form>
							</div>
							<div class="members w-60 dark:bg-dc-sidebar-bg-dark"></div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default App;
