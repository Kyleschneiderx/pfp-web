"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaArea from "./media-area";
import { useModal } from "@/app/contexts/ModalContext";
import MediaControls from "./media-controls";
import MeetingRoomSidePanel from "../modals/meeting-room-side-panel";
import Button from "../elements/Button";
import { PhoneIcon } from "lucide-react";
import MeetingLobby from "./meeting-lobby";
import Card from "../elements/Card";
import clsx from "clsx";
import type { Meeting } from "@/app/models/meeting_model";
import socketClient from "@/app/services/socket-client";
import useAudioStream from "@/app/hooks/useAudioStream";

export default function MeetingRoom({ meeting }: { meeting: Meeting }) {
	const [isVideoOn, setIsVideoOn] = useState(true);
	const [isAudioOn, setIsAudioOn] = useState(true);
	const [isRecording, setIsRecording] = useState(false);
	const [isCallActive, setIsCallActive] = useState(false);
	const [isMeetingEnd, setIsMeetingEnd] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream>();
	const iceServersRef = useRef<RTCConfiguration["iceServers"]>();
	const [selectedDevices, setSelectedDevices] = useState<
		Record<MediaDeviceKind, MediaDeviceInfo["deviceId"] | undefined>
	>({
		audiooutput: undefined,
		audioinput: undefined,
		videoinput: undefined,
	});
	const streamDevicesRef = useRef<MediaDeviceInfo[]>([]);
	const peerConnectionRef = useRef<RTCPeerConnection>();
	const iceCandidateQueueRef = useRef<RTCLocalIceCandidateInit[]>([]);
	const modal = useModal();

	const meetingSocket = useMemo(() => socketClient({ namespace: "meeting" }), []);

	useAudioStream({
		start: isRecording,
		emitLocal: (data: ArrayBuffer) => {
			console.log("Emitting provider audio data to socket");
			meetingSocket.emit("audio", { roomId: meeting.id, audio: data, speaker: "provider" });
		},
		emitRemote: (data: ArrayBuffer) => {
			console.log("Emitting patient audio data to socket");
			meetingSocket.emit("audio", { roomId: meeting.id, audio: data, speaker: "patient" });
		},
		emitInterval: 30 * 1000,
		localStream: localStream,
		remoteStream: remoteStream,
	});

	const cleanupStream = () => {
		if (localStream) {
			for (const track of localStream.getTracks()) {
				track.stop();
				localStream.removeTrack(track);
			}
			setLocalStream(null);
		}

		if (peerConnectionRef.current) {
			peerConnectionRef.current.close();
		}
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
		} catch (error) {
			console.error("Error accessing media devices:", error);
		}
	};

	const initializePeerConnection = (iceServers: RTCConfiguration["iceServers"]) => {
		peerConnectionRef.current = new RTCPeerConnection({ iceServers });

		if (localStream) {
			for (const track of localStream.getTracks()) {
				peerConnectionRef.current.addTrack(track, localStream);
			}
		}

		// Send ICE candidates to other peer via signaling
		peerConnectionRef.current.addEventListener("icecandidate", (e) => {
			if (!e.candidate) return;

			meetingSocket.emit("candidate", { roomId: meeting.id, candidate: e.candidate });
		});

		// Remote track(s) -> attach to remoteVideo
		peerConnectionRef.current.addEventListener("track", (ev) => {
			// Most browsers provide ev.streams[0]
			setRemoteStream((prev) => {
				let remoteStream = ev?.streams?.[0];
				if (!remoteStream) {
					const remoteMediaStream = new MediaStream();
					remoteMediaStream.addTrack(ev.track);
					remoteStream = remoteMediaStream;
				}
				return remoteStream;
			});
		});

		// Optional: connection state updates
		peerConnectionRef.current.addEventListener("connectionstatechange", () => {
			console.log("peer connection change", peerConnectionRef.current?.connectionState);
			if (peerConnectionRef.current?.connectionState === "disconnected") {
				setRemoteStream(undefined);
			}
		});
	};

	// Initialize WebRTC connection
	useEffect(() => {
		initializeWebRTC();

		meetingSocket.connect();

		meetingSocket.on("ice_servers", (data) => {
			iceServersRef.current = data;
		});

		meetingSocket.on("offer", async ({ from, sdp }) => {
			if (!peerConnectionRef.current) return;
			await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
			const answer = await peerConnectionRef.current.createAnswer();
			await peerConnectionRef.current.setLocalDescription(answer);
			meetingSocket.emit("answer", { roomId: meeting.id, sdp: answer });
		});

		meetingSocket.on("answer", async ({ from, sdp }) => {
			if (!peerConnectionRef.current) return;
			await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
			if (iceCandidateQueueRef.current.length) {
				for (const candidate of iceCandidateQueueRef.current) {
					await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
				}
				iceCandidateQueueRef.current = [];
			}
		});

		meetingSocket.on("candidate", async ({ candidate }) => {
			if (!peerConnectionRef.current) return;
			if (!peerConnectionRef.current.remoteDescription) {
				iceCandidateQueueRef.current.push(candidate);
				return;
			}
			if (!candidate) return;
			await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
		});

		meetingSocket.on("server_error", (data) => {
			console.error("[MEETING SOCKET]:", data);
		});

		return () => {
			meetingSocket.disconnect();

			cleanupStream();
		};
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

	const handleEndCall = () => {
		cleanupStream();
		setIsCallActive(false);
		setIsMeetingEnd(true);
	};

	const handleResume = () => {
		initializeWebRTC();
		setIsMeetingEnd(false);
	};

	const handleJoin = () => {
		if (!iceServersRef.current) return;

		initializePeerConnection(iceServersRef.current);

		meetingSocket.emit("join", { roomId: meeting.id }, async (response) => {
			if (response !== "ok") return;

			if (!peerConnectionRef.current) return;

			const offer = await peerConnectionRef.current.createOffer();
			await peerConnectionRef.current.setLocalDescription(offer);
			meetingSocket.emit("offer", { roomId: meeting.id, sdp: offer });
		});

		setIsCallActive(true);
	};

	return !isCallActive ? (
		<MeetingLobby
			meeting={meeting}
			isVideoOn={isVideoOn}
			isAudioOn={isAudioOn}
			isMeetingEnd={isMeetingEnd}
			toggleVideo={() => setIsVideoOn((prev) => !prev)}
			toggleAudio={() => setIsAudioOn((prev) => !prev)}
			onResume={handleResume}
			onJoin={handleJoin}
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
			<div className="grid grid-cols-9 h-full">
				<div className="flex-1 flex flex-col col-span-6 h-full">
					<MediaArea
						meeting={meeting}
						isRecording={isRecording}
						isVideoOn={isVideoOn}
						isAudioOn={isAudioOn}
						isCallActive={isCallActive}
						isScreenSharing={isScreenSharing}
						stream={localStream}
						remoteStream={remoteStream}
						roomId={"11111-111-1111"}
						className="flex flex-1"
					/>
					<div className="p-4 flex flex-row  items-end ">
						<div className="flex items-center flex-1">
							{/* <Button
								onClick={() => handleEndCall()}
								className={clsx(
									"!rounded-full h-12 w-12  !p-0",
									isCallActive
										? "bg-error-500 hover:bg-error-600 text-white "
										: "text-neutral-700 hover:text-error-600",
								)}
							>
								<PhoneIcon className="h-6 w-6" />
							</Button> */}
							<MediaControls
								isVideoOn={isVideoOn}
								isAudioOn={isAudioOn}
								isRecording={isRecording}
								onEndCall={handleEndCall}
								onToggleVideo={() => setIsVideoOn((prev) => !prev)}
								onToggleAudio={() => setIsAudioOn((prev) => !prev)}
								onToggleRecording={() => setIsRecording((prev) => !prev)}
							/>
						</div>
					</div>
				</div>
				<Card className="col-span-3 overflow-y-auto !p-0">
					<MeetingRoomSidePanel meeting={meeting} />
				</Card>
			</div>
		</div>
	);
}
