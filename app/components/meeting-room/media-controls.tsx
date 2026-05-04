"use client";

import clsx from "clsx";
import { CircleIcon, MicIcon, MicOffIcon, PhoneIcon, SquareIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import Button from "../elements/Button";

interface MediaControlsProps {
	isVideoOn: boolean;
	isAudioOn: boolean;
	onEndCall: () => void;
	onToggleVideo: () => void;
	onToggleAudio: () => void;
	isRecording?: boolean;
	recordingBusy?: boolean;
	onRecordingClick?: () => void;
	className?: string;
}

export default function MediaControls({
	isVideoOn,
	isAudioOn,
	onToggleVideo,
	onToggleAudio,
	onEndCall,
	isRecording,
	recordingBusy,
	onRecordingClick,
	className,
}: MediaControlsProps) {
	const showRecording = onRecordingClick !== undefined;

	return (
		<div className={clsx("flex flex-row flex-1 justify-center items-center ", className)}>
			<div className="flex flex-row items-center rounded-2xl py-2 px-10 bg-white shadow-md text-neutral-500 space-x-5">
				<Button
					onClick={onEndCall}
					className={clsx("!rounded-full h-10 w-10  !p-0 bg-error-400 hover:bg-error-600 text-white ")}
				>
					<PhoneIcon className="h-6 w-6" />
				</Button>
				<Button onClick={onToggleVideo} className="!rounded-full h-12 w-12 !p-0  hover:text-primary-600">
					{isVideoOn ? <VideoIcon className="h-6 w-6" /> : <VideoOffIcon className="h-6 w-6" />}
				</Button>

				<Button onClick={onToggleAudio} className="!rounded-full h-12 w-12 !p-0  hover:text-primary-600">
					{isAudioOn ? <MicIcon className="h-6 w-6" /> : <MicOffIcon className="h-6 w-6" />}
				</Button>

				{showRecording && (
					<Button
						type="button"
						isProcessing={recordingBusy}
						disabled={recordingBusy}
						onClick={onRecordingClick}
						className={clsx(
							"!rounded-full h-12 w-12 !p-0",
							isRecording ? "bg-error-100 text-error-600 hover:bg-error-200" : "hover:text-primary-600",
						)}
						aria-pressed={isRecording}
						aria-label={isRecording ? "Stop recording" : "Start recording"}
					>
						{isRecording ? <SquareIcon className="h-6 w-6" /> : <CircleIcon className="h-6 w-6" />}
					</Button>
				)}
			</div>
		</div>
	);
}
