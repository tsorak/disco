interface Reaction {
    emote: string;
    count: number;
}

interface Message {
    id: string | undefined;
    sender: {
        id: string | undefined;
        name: string | undefined;
    };
    reactions: Reaction[] | undefined;
    date: string | undefined;
    content: string | undefined;
}

export default function Message(props: Message) {
    const { id, sender, reactions, date, content } = props;

    return (
        <li id={id}>
            <div class="message transition-colors hover:bg-dc-msg-selected-dark px-6 mt-[2px] pb-[2px]">
                <h3 class="messageHeader dark:text-dc-primary-text-dark">
                    <span class="text-xs dark:text-dc-placeholder-text-dark font-light cursor-default">{date || "13:37"}</span>
                    <span class="ml-1">{sender?.name || "Username"}</span>
                </h3>
                <div class="messageContent px-12 dark:text-[#ccc]">{content}</div>
                <div class="messageReactions px-12 flex gap-2">
                    {reactions?.map((reaction) => (
                        <button class="px-1 py-[1px] bg-[#06f2] border-[1px] border-[#06f5] rounded-md">
                            {reaction.emote} {reaction.count}
                        </button>
                    ))}
                </div>
            </div>
        </li>
    );
}
