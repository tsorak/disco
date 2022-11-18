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

	return (
		<>
			<div class="flex h-screen dark:bg-serverbar-bg-dark text-sidebar-text-dark">
				<nav class="w-[72px]"></nav>
				<div class="flex-grow bg-sidebar-bg-dark flex">
					<div class="sidebar w-60 flex flex-col">
						<nav class="privateChannels flex flex-col flex-grow">
							<div class="flex h-12 border-b-[1px] dark:border-serverbar-bg-dark">
								<button class="m-[10px] bg-serverbar-bg-dark flex-grow rounded text-sm p-1 px-[6px] text-left tracking-tight font-semibold" type="button">
									Find or start a conversation
								</button>
							</div>
							<div>
								<ul>
									<li></li>
								</ul>
							</div>
						</nav>
						<section class="panels h-[52px] dark:bg-profile-bg-dark"></section>
					</div>
					<div class="content dark:bg-foreground-bg-dark flex-grow flex flex-col">
						<section class="chat-header flex h-12 justify-between px-4 border-b-[1px] dark:border-serverbar-bg-dark">
							{/* <form class="title">
							</form> */}
							<form class="channel-name flex" onchange={inputHandler}>
								<input class="bg-transparent text-primary-text-dark focus:outline-none font-semibold text-lg leading-none flex-shrink-1" type="text" name="chat_title" id="chat_title" value={chat.title} size={chat.title.length / 2} oninput={textInputSizeHandler} autocomplete="off" spellcheck={false} />
							</form>
							<div class="toolbar flex items-center gap-4">
								<button>📞</button>
								<button>🎥</button>
								<button>📌</button>
								<button>👤</button>
								<button>👥</button>
								<input class="bg-serverbar-bg-dark rounded text-sm p-1 px-[6px] text-left tracking-tight font-normal w-36 focus:outline-none" type="text" placeholder="Search" />
								<button>📥</button>
								<button class="w-6 h-6 dark:text-foreground-bg-dark dark:bg-placeholder-text-dark dark:hover:bg-interactable-text-dark rounded-full font-semibold">?</button>
							</div>
						</section>
						<div class="chatarea flex-grow flex">
							<div class="chatContent flex-grow"></div>
							<div class="members w-60 dark:bg-sidebar-bg-dark"></div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default App;
