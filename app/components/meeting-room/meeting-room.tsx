"use client";

import { useEffect, useRef, useState } from "react";
import MediaArea from "./media-area";
import { useModal } from "@/app/contexts/ModalContext";
import MediaControls from "./media-controls";
import MeetingRoomSidePanel from "../modals/meeting-room-side-panel";
import Button from "../elements/Button";
import { ArrowLeftIcon, InfoIcon, MenuIcon, PhoneIcon } from "lucide-react";
import MeetingLobby from "./meeting-lobby";
import Card from "../elements/Card";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import clsx from "clsx";
import type { Meeting } from "@/app/models/meeting_model";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

export default function MeetingRoom({ meeting }: { meeting: Meeting }) {
	const [isVideoOn, setIsVideoOn] = useState(true);
	const [isAudioOn, setIsAudioOn] = useState(true);
	const [isCallActive, setIsCallActive] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [sessionDuration, setSessionDuration] = useState(0);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [selectedDevices, setSelectedDevices] = useState<
		Record<MediaDeviceKind, MediaDeviceInfo["deviceId"] | undefined>
	>({
		audiooutput: undefined,
		audioinput: undefined,
		videoinput: undefined,
	});
	const streamDevicesRef = useRef<MediaDeviceInfo[]>([]);
	const modal = useModal();

	const cleanupStream = () => {
		if (localStream) {
			for (const track of localStream.getTracks()) {
				track.stop();
				localStream.removeTrack(track);
			}
			setLocalStream(null);
		}
		setConnectionStatus("disconnected");
	};

	const initializeWebRTC = async () => {
		try {
			// Get user media
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			streamDevicesRef.current = await navigator.mediaDevices.enumerateDevices();

			const speaker = streamDevicesRef.current.find(
				(device) => device.kind === "audiooutput" && device.deviceId === "default",
			);

			if (speaker) {
				setSelectedDevices((prev) => {
					return {
						...prev,
						[speaker.kind]: speaker.deviceId,
					};
				});
			}

			setLocalStream(stream);

			// Simulate connection establishment
			setTimeout(() => {
				setConnectionStatus("connected");
			}, 2000);
		} catch (error) {
			console.error("Error accessing media devices:", error);
		}
	};

	// Initialize WebRTC connection
	useEffect(() => {
		initializeWebRTC();

		return () => cleanupStream();
	}, []);

	// Handle video/audio toggle
	useEffect(() => {
		if (localStream) {
			const videoTrack = localStream.getVideoTracks()[0];
			const audioTrack = localStream.getAudioTracks()[0];

			if (videoTrack) {
				videoTrack.enabled = isVideoOn;
			}
			if (audioTrack) {
				audioTrack.enabled = isAudioOn;
			}
		}
	}, [isVideoOn, isAudioOn, localStream]);

	useEffect(() => {
		const updateMediaStream = async () => {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: selectedDevices.videoinput ? { deviceId: { exact: selectedDevices.videoinput } } : true,
				audio: selectedDevices.audioinput ? { deviceId: { exact: selectedDevices.audioinput } } : true,
			});

			streamDevicesRef.current = await navigator.mediaDevices.enumerateDevices();

			setLocalStream(stream);
		};

		updateMediaStream();
	}, [selectedDevices]);

	// Session timer
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isCallActive) {
			interval = setInterval(() => {
				setSessionDuration((prev) => prev + 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isCallActive]);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const handleEndCall = () => {
		cleanupStream();
		setIsCallActive(false);
	};

	const toggleSidePanel = () => {
		modal.open({
			type: "panel",
			overlay: false,
			component: ({ close }) => <MeetingRoomSidePanel meeting={meeting} onClose={close} />,
		});
	};

	return !isCallActive ? (
		<MeetingLobby
			isVideoOn={isVideoOn}
			isAudioOn={isAudioOn}
			toggleVideo={() => setIsVideoOn((prev) => !prev)}
			toggleAudio={() => setIsAudioOn((prev) => !prev)}
			onJoin={() => setIsCallActive(true)}
			stream={localStream}
			streamDevices={streamDevicesRef.current}
			selectedDevices={selectedDevices}
			onSelectDevice={(kind: MediaDeviceKind, device: MediaDeviceInfo["deviceId"]) => {
				return setSelectedDevices((prev) => {
					let newDevices = prev;

					newDevices = {
						...prev,
						[kind]: device,
					};

					return newDevices;
				});
			}}
		/>
	) : (
		<div className="flex-1 flex flex-col h-full">
			<div className="grid grid-cols-7 h-full">
				<div className="flex-1 flex flex-col col-span-5 h-full">
					<MediaArea
						isVideoOn={isVideoOn}
						isAudioOn={isAudioOn}
						isCallActive={isCallActive}
						isScreenSharing={isScreenSharing}
						stream={localStream}
						roomId={"11111-111-1111"}
						className="flex flex-1"
					/>
					<div className="p-4 flex flex-row  items-end ">
						<div className="flex items-center flex-1">
							<Button
								onClick={() => handleEndCall()}
								className={clsx(
									"!rounded-full h-12 w-12  !p-0",
									isCallActive
										? "bg-error-500 hover:bg-error-600 text-white "
										: "text-neutral-700 hover:text-error-600",
								)}
							>
								<PhoneIcon className="h-6 w-6" />
							</Button>
							<MediaControls
								isVideoOn={isVideoOn}
								isAudioOn={isAudioOn}
								isCallActive={isCallActive}
								isScreenSharing={isScreenSharing}
								onToggleVideo={() => setIsVideoOn((prev) => !prev)}
								onToggleCall={() => setIsCallActive((prev) => !prev)}
								onToggleAudio={() => setIsAudioOn((prev) => !prev)}
								onToggleScreenSharing={() => setIsScreenSharing((prev) => !prev)}
							/>
						</div>
					</div>
				</div>
				<Card className="col-span-2 overflow-y-auto !p-0">
					<MeetingRoomSidePanel meeting={meeting} />
				</Card>
			</div>
		</div>
	);
}
