import { channelName, setChannelName } from "../state";
import { Title } from "solid-start";

export default function ChannelTitle(props) {
	let channelTitleElem, spoofElem;

	const inputHandler = (e) => {
		setChannelName(e.target.value);
	};

	const submitHandler = (e) => {
		e.preventDefault();
		e.target.channel_title.blur();
	};

	return (
		<>
			<Title>Disco - {channelName()}</Title>
			<form class="channel-name flex items-center" onchange={inputHandler} onSubmit={submitHandler}>
				<input type="text" class="w-0 absolute peer" name="channel_title" id="channel_title" value={channelName()} oninput={inputHandler} ref={channelTitleElem} onfocus={() => channelTitleElem.select()} />
				<input type="button" class="transition-colors bg-[#0000] peer-focus:bg-[#0001] hover:bg-[#fff1] text-dc-primary-text-dark focus:outline-none font-semibold text-lg leading-none py-2 px-1" ref={spoofElem} value={channelName()} onclick={() => channelTitleElem.focus()} />
			</form>
		</>
	);
}
