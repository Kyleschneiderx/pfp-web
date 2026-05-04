"use client";

import type { Meeting } from "@/app/models/meeting_model";
import clsx from "clsx";
import { MicIcon, MicOffIcon, User, UserIcon } from "lucide-react";
import type { Ref } from "react";
import Card from "../elements/Card";

interface VideoCallInterfaceProps {
	meeting: Meeting;
	visitBeingRecorded: boolean;
	isVideoOn: boolean;
	isAudioOn: boolean;
	isCallActive: boolean;
	isScreenSharing: boolean;
	hasRemoteVideo: boolean;
	localVideoRef: Ref<HTMLVideoElement>;
	remoteVideoRef: Ref<HTMLVideoElement>;
	roomId: string;
	className?: string;
}

export default function MediaArea({
	meeting: _meeting,
	visitBeingRecorded,
	isVideoOn,
	isAudioOn,
	isScreenSharing,
	hasRemoteVideo,
	localVideoRef,
	remoteVideoRef,
	className,
}: VideoCallInterfaceProps) {
	return (
		<div className={clsx("flex flex-col flex-1 px-4 space-y-4 text-neutral-700", className)}>
			<div className="h-full">
				<Card className="relative overflow-hidden !bg-neutral-900 !p-0 h-full max-h-[600px]">
					{visitBeingRecorded && (
						<div className="flex absolute top-1 left-1 z-[99]">
							<div className="flex items-center">
								<span className="text-error-500 text-2xl -mt-[3px] mr-1">•</span>

								<span className="text-neutral-200 text-xs font-medium">Recording</span>
								<MicIcon className="w-3 h-3 text-neutral-200" />
							</div>
						</div>
					)}

					<video
						ref={remoteVideoRef}
						autoPlay
						playsInline
						muted={false}
						className="w-full h-full object-contain scale-150 origin-center"
					/>

					{!hasRemoteVideo && (
						<div className="absolute inset-0 flex items-center justify-center bg-muted">
							<div className="text-center">
								<div className="h-16 w-16 rounded-full bg-neutral-300/20 flex items-center justify-center mx-auto mb-3">
									<UserIcon className="h-8 w-8 text-neutral-100" />
								</div>
								<p className="text-sm text-neutral-100">Waiting for patient...</p>
							</div>
						</div>
					)}

					<Card className="!absolute bottom-0 overflow-hidden !bg-neutral-200 !p-0 !w-44 !h-44 m-3">
						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted
							className="w-full h-full object-cover scale-150 origin-center"
						/>
						{!isVideoOn && (
							<div className="absolute inset-0 flex items-center bg-neutral-300/50 justify-center bg-muted">
								<div className="h-16 w-16 rounded-full bg-neutral-900/50 flex items-center justify-center mx-auto mb-3">
									<User className="h-8 w-8 text-neutral-100" />
								</div>
							</div>
						)}
						{!isAudioOn && (
							<div className="absolute bottom-3 right-3 rounded-full bg-primary-500 p-1">
								<MicOffIcon className="w-4 h-4 text-neutral-100" />
							</div>
						)}
					</Card>
				</Card>
			</div>

			{isScreenSharing && (
				<Card className="p-4 bg-primary/5 border-primary/20 !bg-neutral-100">
					<div className="flex items-center gap-2 text-primary">
						<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
						<span className="text-sm font-medium">Screen sharing active</span>
					</div>
				</Card>
			)}
		</div>
	);
}
