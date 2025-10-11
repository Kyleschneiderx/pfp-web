"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { DotIcon, MicIcon, MicOffIcon, User, UserIcon, Wifi, WifiIcon, WifiOff, WifiOffIcon } from "lucide-react";
import Badge from "../elements/Badge";
import Card from "../elements/Card";
import clsx from "clsx";
import Button from "../elements/Button";
import type { Meeting } from "@/app/models/meeting_model";

interface VideoCallInterfaceProps {
	meeting: Meeting;
	isVideoOn: boolean;
	isAudioOn: boolean;
	isRecording: boolean;
	isCallActive: boolean;
	isScreenSharing: boolean;
	roomId: string;
	className?: string;
	stream: MediaStream | null;
	remoteStream?: MediaStream | null;
}

export default function MediaArea({
	meeting,
	isVideoOn,
	isAudioOn,
	isRecording,
	isCallActive,
	isScreenSharing,
	roomId,
	className,
	stream,
	remoteStream,
}: VideoCallInterfaceProps) {
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (!localVideoRef.current) return;

		localVideoRef.current.srcObject = stream;
	}, [stream]);

	useEffect(() => {
		if (!remoteVideoRef.current) return;

		if (!remoteStream) return;

		remoteVideoRef.current.srcObject = remoteStream;
	}, [remoteStream]);

	return (
		<div className={clsx("flex flex-col flex-1 px-4 space-y-4 text-neutral-700", className)}>
			<div className="h-full">
				<Card className="relative overflow-hidden !bg-neutral-900 !p-0 h-full max-h-[600px]">
					{isRecording && (
						<div className="flex absolute top-1 left-1">
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
						className="w-full h-full object-cover scale-125 origin-center"
					/>

					{!remoteStream && (
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
						{/* {connectionStatus !== "connected" && (
							<div className="absolute top-0 left-0 flex items-center justify-center z-20 gap-1 text-xs m-1 bg-primary-500 p-1 rounded-full text-neutral-100">
								<WifiOffIcon className="h-3 w-3" />
								Connecting...
							</div>
						)} */}

						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted={false}
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

			{/* Screen Sharing Indicator */}
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
