"use client";

import {
	ArrowLeftIcon,
	MenuIcon,
	MicIcon,
	MicOffIcon,
	MonitorIcon,
	PhoneIcon,
	PhoneOffIcon,
	VideoIcon,
	VideoOffIcon,
} from "lucide-react";
import Button from "../elements/Button";
import clsx from "clsx";

interface MediaControlsProps {
	isVideoOn: boolean;
	isAudioOn: boolean;
	isCallActive: boolean;
	isScreenSharing: boolean;
	onToggleVideo: () => void;
	onToggleAudio: () => void;
	onToggleCall: () => void;
	onToggleScreenSharing: () => void;
	className?: string;
}

export default function MediaControls({
	isVideoOn,
	isAudioOn,
	isCallActive,
	isScreenSharing,
	onToggleVideo,
	onToggleAudio,
	onToggleCall,
	onToggleScreenSharing,
	className,
}: MediaControlsProps) {
	return (
		<div className={clsx("flex flex-row flex-1 justify-center items-center ", className)}>
			<div className="flex flex-row rounded-2xl py-2 px-10 bg-white shadow-md text-neutral-500 space-x-5">
				<Button onClick={onToggleVideo} className="!rounded-full h-12 w-12 !p-0  hover:text-primary-600">
					{isVideoOn ? <VideoIcon className="h-6 w-6" /> : <VideoOffIcon className="h-6 w-6" />}
				</Button>

				<Button onClick={onToggleAudio} className="!rounded-full h-12 w-12 !p-0  hover:text-primary-600">
					{isAudioOn ? <MicIcon className="h-6 w-6" /> : <MicOffIcon className="h-6 w-6" />}
				</Button>

				<Button
					onClick={onToggleScreenSharing}
					className={clsx(
						"!rounded-full h-12 w-12 !p-0 ",
						isScreenSharing ? "bg-primary-500 hover:bg-primary-600 text-white " : "hover:text-primary-600",
					)}
				>
					<MonitorIcon className="h-6 w-6" />
				</Button>

				{/* <Button
					onClick={onToggleCall}
					className={clsx(
						"!rounded-full h-12 w-12  !p-0",
						isCallActive ? "bg-primary-500 hover:bg-primary-600 text-white " : "hover:text-primary-600",
					)}
				>
					<PhoneIcon className="h-6 w-6" />
				</Button> */}
			</div>
		</div>
	);
}
