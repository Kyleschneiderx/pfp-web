import type { SupportChatSearchParams } from "@/app/components/chat/models";
import dynamic from "next/dynamic";

const ChatForm = dynamic(() => import("@/app/components/chat/chat-form"), {
	ssr: false,
});

export default async function Page({ searchParams }: { searchParams?: SupportChatSearchParams }) {
	return (
		<div className="flex flex-col h-full gap-y-4 md:gap-y-0 md:flex-row gap-x-4">
			<ChatForm />
		</div>
	);
}
