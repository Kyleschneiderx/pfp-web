"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import Button from "../elements/Button";
import {
	CalendarIcon,
	ChevronDown,
	MicIcon,
	MicOffIcon,
	PhoneOffIcon,
	SpeakerIcon,
	UserIcon,
	VideoIcon,
	VideoOffIcon,
} from "lucide-react";
import Card from "../elements/Card";
import { formatDate, formatDatetime } from "@/app/lib/utils";
import ResponsiveActionMenu from "../elements/ResponsiveActionMenu";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Meeting } from "@/app/models/meeting_model";

interface MeetingLobbyProps {
	meeting: Meeting;
	onJoin: () => void;
	stream: MediaStream | null;
	streamDevices: MediaDeviceInfo[];
	toggleVideo: () => void;
	toggleAudio: () => void;
	onResume: () => void;
	isVideoOn: boolean;
	isAudioOn: boolean;
	isMeetingEnd: boolean;
	onSelectDevice: (kind: MediaDeviceKind, device: MediaDeviceInfo["deviceId"]) => void;
	selectedDevices: Record<MediaDeviceKind, MediaDeviceInfo["deviceId"] | undefined>;
}

export default function MeetingLobby({
	meeting,
	stream,
	streamDevices,
	selectedDevices,
	onJoin,
	isVideoOn,
	isAudioOn,
	isMeetingEnd,
	toggleVideo,
	toggleAudio,
	onResume,
	onSelectDevice,
}: MeetingLobbyProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (!videoRef.current) return;

		videoRef.current.srcObject = stream;

		const updateVideoSpeaker = async () => {
			if (!videoRef.current || !selectedDevices.audiooutput) return;
			if (typeof videoRef.current.setSinkId === "function") {
				try {
					await videoRef.current.setSinkId(selectedDevices.audiooutput);
				} catch (err) {
					console.error("Error setting speaker:", err);
				}
			} else {
				console.warn("Selecting video speaker is not supported in this browser");
			}
		};

		updateVideoSpeaker();
	}, [stream, selectedDevices]);

	return (
		<div className="flex flex-col items-center px-12 mt-12">
			{isMeetingEnd ? (
				<div className="flex flex-col h-full w-full justify-center items-center space-y-10 text-neutral-900">
					<div className="rounded-full border-[6px] border-error-400 p-6">
						<PhoneOffIcon className="w-16 h-16 text-error-400" />
					</div>
					<p className="text-4xl font-semibold">You left the visit</p>
					<div className="flex flex-row items-center space-x-3">
						<Button secondary label="Close" onClick={() => window.close()} />
						<Button label="Lobby" onClick={onResume} />
					</div>
				</div>
			) : (
				<div className="flex flex-col space-y-3">
					<Card className="!p-0">
						<div className="relative overflow-hidden rounded-tl-lg rounded-tr-lg !bg-neutral-900 !max-w-[600px] !max-h-[350px] min-w-[600px] min-h-[350px]">
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted={false}
								className="w-full h-full object-cover scale-125 origin-center"
							/>
							<div className="flex flex-row w-full items-center absolute bottom-0 text-neutral-100 p-3 justify-center space-x-3">
								<Button
									onClick={toggleVideo}
									className="!rounded-full border-2 border-neutral-200 h-12 w-12 !p-0  hover:text-neutral-50 hover:border-neutral-50"
								>
									{isVideoOn ? <VideoIcon className="h-6 w-6" /> : <VideoOffIcon className="h-6 w-6" />}
								</Button>

								<Button
									onClick={toggleAudio}
									className="!rounded-full border-2 border-neutral-200 h-12 w-12 !p-0  hover:text-neutral-50 hover:border-neutral-50"
								>
									{isAudioOn ? <MicIcon className="h-6 w-6" /> : <MicOffIcon className="h-6 w-6" />}
								</Button>
							</div>
						</div>
						<div className="flex flex-row items-center space-y-3 p-6 text-neutral-900">
							<div className="flex flex-col">
								<div className="flex flex-row items-center space-x-2">
									<UserIcon className="w-5 h-5" />
									<span className="text-lg ">{meeting.user_profile?.name}</span>
								</div>
								<div className="flex flex-row items-center space-x-2">
									<CalendarIcon className="w-5 h-5" />
									<span className="text-lg">{formatDatetime(new Date(meeting.starts_at), "EEE, MMM d h:mm a")}</span>
								</div>
							</div>
							<div className="flex flex-row items-center space-x-3 ml-auto">
								<Button label="Leave" onClick={() => window.close()} className=" !w-22 !bg-error-400 text-white" />
								<Button label="Join" onClick={onJoin} className="!w-22" />
							</div>
						</div>
					</Card>
					<div className="flex flex-row justify-center w-full py-1 space-x-3 text-neutral-900">
						<ResponsiveActionMenu
							icon={
								<div
									className={`
                flex flex-row items-center space-x-1 cursor-pointer hover:text-neutral-700 rounded-full px-3 p-1
                border border-transparent hover:border-neutral-300 hover:border
              `}
								>
									<VideoIcon className="w-4 h-4" />
									<div className="flex items-center">
										<span className="text-sm truncate w-32">
											{
												streamDevices.find(
													(device) => device.deviceId === stream?.getVideoTracks()[0].getSettings().deviceId,
												)?.label
											}
										</span>
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
							}
							align="center"
							content={() => {
								return (
									<div className="flex flex-col p-1">
										{streamDevices
											.filter((device) => device.kind === "videoinput")
											.map((device) => (
												<button
													type="button"
													key={device.deviceId}
													className={clsx(
														"text-left p-3 hover:bg-primary-100 cursor-pointer",
														device.deviceId === stream?.getVideoTracks()[0].getSettings().deviceId
															? "bg-primary-100"
															: "bg-white",
													)}
												>
													{device.label}
												</button>
											))}
									</div>
								);
							}}
						/>
						<ResponsiveActionMenu
							icon={
								<div
									className={`
                flex flex-row items-center space-x-1 cursor-pointer hover:text-neutral-700 rounded-full px-3 p-1
                border border-transparent hover:border-neutral-300 hover:border
              `}
								>
									<MicIcon className="w-4 h-4" />
									<div className="flex items-center">
										<span className="text-sm truncate w-32">
											{
												streamDevices.find(
													(device) =>
														device.kind === "audioinput" &&
														device.deviceId === stream?.getAudioTracks()[0].getSettings().deviceId,
												)?.label
											}
										</span>
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
							}
							align="center"
							content={() => {
								return (
									<div className="flex flex-col p-1">
										{streamDevices
											.filter((device) => device.kind === "audioinput")
											.map((device) => (
												<button
													type="button"
													key={device.deviceId}
													onClick={() => onSelectDevice(device.kind, device.deviceId)}
													className={clsx(
														"text-left p-3 hover:bg-primary-100 cursor-pointer",
														device.kind === "audioinput" &&
															device.deviceId === stream?.getAudioTracks()[0].getSettings().deviceId
															? "bg-primary-100"
															: "bg-white",
													)}
												>
													{device.label}
												</button>
											))}
									</div>
								);
							}}
						/>
						<ResponsiveActionMenu
							icon={
								<div
									className={`
                flex flex-row items-center space-x-1 cursor-pointer hover:text-neutral-700 rounded-full px-3 p-1
                border border-transparent hover:border-neutral-300 hover:border
              `}
								>
									<SpeakerIcon className="w-4 h-4" />
									<div className="flex items-center">
										<span className="text-sm truncate w-32">
											{
												streamDevices.find(
													(device) => device.kind === "audiooutput" && device.deviceId === selectedDevices.audiooutput,
												)?.label
											}
										</span>
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
							}
							align="center"
							content={() => {
								return (
									<div className="flex flex-col p-1">
										{streamDevices
											.filter((device) => device.kind === "audiooutput")
											.map((device) => (
												<button
													type="button"
													key={device.deviceId}
													onClick={() => onSelectDevice(device.kind, device.deviceId)}
													className={clsx(
														"text-left p-3 hover:bg-primary-100 cursor-pointer",
														device.kind === "audiooutput" && device.deviceId === selectedDevices.audiooutput
															? "bg-primary-100"
															: "bg-white",
													)}
												>
													{device.label}
												</button>
											))}
									</div>
								);
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
