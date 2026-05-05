"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import type { MeetingSessionJoinInfo } from "@/app/models/chime_session_model";
import type { Meeting } from "@/app/models/meeting_model";
import {
	getMeeting,
	getMeetingSession,
	startMeetingRecording,
	stopMeetingRecording,
} from "@/app/services/client_side/meetings";
import {
	type AudioVideoObserver,
	ConsoleLogger,
	DefaultDeviceController,
	DefaultMeetingSession,
	LogLevel,
	MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "../elements/Card";
import MeetingRoomSidePanel from "../modals/meeting-room-side-panel";
import MediaArea from "./media-area";
import MediaControls from "./media-controls";
import MeetingLobby from "./meeting-lobby";

export default function MeetingRoom({
	meeting: meetingProp,
}: {
	meeting: Meeting;
}) {
	const [meeting, setMeeting] = useState<Meeting>(meetingProp);
	const [isVideoOn, setIsVideoOn] = useState(true);
	const [isAudioOn, setIsAudioOn] = useState(true);
	const [isCallActive, setIsCallActive] = useState(false);
	const [isMeetingEnd, setIsMeetingEnd] = useState(false);
	const [isScreenSharing] = useState(false);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
	const [chimeSession, setChimeSession] = useState<MeetingSessionJoinInfo | null>(null);
	const [sessionLoading, setSessionLoading] = useState(true);
	const [sessionError, setSessionError] = useState<string | null>(null);
	const [joining, setJoining] = useState(false);
	const [lobbyMediaKey, setLobbyMediaKey] = useState(0);

	const [selectedDevices, setSelectedDevices] = useState<
		Record<MediaDeviceKind, MediaDeviceInfo["deviceId"] | undefined>
	>({
		audiooutput: undefined,
		audioinput: undefined,
		videoinput: undefined,
	});
	const streamDevicesRef = useRef<MediaDeviceInfo[]>([]);
	const meetingSessionRef = useRef<InstanceType<typeof DefaultMeetingSession> | null>(null);
	const chimeObserverRef = useRef<AudioVideoObserver | null>(null);
	const localVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
	const [recordingBusy, setRecordingBusy] = useState(false);
	const { showSnackBar } = useSnackBar();
	const meetingSlugRef = useRef(meeting.slug);
	const meetingRef = useRef(meeting);

	const loadChimeSession = useCallback(async () => {
		setSessionLoading(true);
		setSessionError(null);
		try {
			const session = await getMeetingSession(meeting.slug);
			setChimeSession({
				chime_meeting: session.chime_meeting,
				attendee: session.attendee,
			});
			setMeeting((prev) => ({
				...prev,
				...(session.domainMeetingPatch ?? {}),
			}));
		} catch (e) {
			const msg =
				e && typeof e === "object" && "msg" in e ? String((e as { msg: string }).msg) : "Could not start visit session";
			setSessionError(msg);
			setChimeSession(null);
		} finally {
			setSessionLoading(false);
		}
	}, [meeting.slug]);

	useEffect(() => {
		loadChimeSession();
	}, [loadChimeSession]);

	useEffect(() => {
		setMeeting((prev) => ({ ...prev, ...meetingProp }));
	}, [meetingProp]);

	useEffect(() => {
		meetingSlugRef.current = meeting.slug;
	}, [meeting.slug]);

	useEffect(() => {
		meetingRef.current = meeting;
	}, [meeting]);

	const stopLobbyPreview = () => {
		setLocalStream((prev) => {
			if (prev) {
				for (const t of prev.getTracks()) {
					t.stop();
				}
			}
			return null;
		});
	};

	useEffect(() => {
		if (isCallActive || isMeetingEnd) return;
		if (sessionLoading || !chimeSession) return;

		let cancelled = false;

		const run = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: selectedDevices.videoinput ? { deviceId: { exact: selectedDevices.videoinput } } : true,
					audio: selectedDevices.audioinput ? { deviceId: { exact: selectedDevices.audioinput } } : true,
				});

				if (cancelled) {
					for (const t of stream.getTracks()) {
						t.stop();
					}
					return;
				}

				streamDevicesRef.current = await navigator.mediaDevices.enumerateDevices();

				const speaker = streamDevicesRef.current.find(
					(device) => device.kind === "audiooutput" && device.deviceId === "default",
				);

				if (speaker) {
					setSelectedDevices((prev) => ({
						...prev,
						audiooutput: prev.audiooutput ?? speaker.deviceId,
					}));
				}

				setLocalStream((prev) => {
					if (prev) {
						for (const t of prev.getTracks()) {
							t.stop();
						}
					}
					return stream;
				});
			} catch (error) {
				console.error("Error accessing media devices:", error);
			}
		};

		void run();

		return () => {
			cancelled = true;
		};
	}, [
		isCallActive,
		isMeetingEnd,
		sessionLoading,
		chimeSession,
		selectedDevices.videoinput,
		selectedDevices.audioinput,
		lobbyMediaKey,
	]);

	useEffect(() => {
		if (!localStream || isCallActive) return;
		const videoTrack = localStream.getVideoTracks()[0];
		const audioTrack = localStream.getAudioTracks()[0];
		if (videoTrack) videoTrack.enabled = isVideoOn;
		if (audioTrack) audioTrack.enabled = isAudioOn;
	}, [isVideoOn, isAudioOn, localStream, isCallActive]);

	useEffect(() => {
		const av = meetingSessionRef.current?.audioVideo;
		if (!av || !isCallActive) return;

		if (isVideoOn) {
			if (!av.hasStartedLocalVideoTile()) {
				av.startLocalVideoTile();
			}
		} else {
			if (av.hasStartedLocalVideoTile()) {
				av.stopLocalVideoTile();
			}
		}
	}, [isVideoOn, isCallActive]);

	useEffect(() => {
		const av = meetingSessionRef.current?.audioVideo;
		if (!av || !isCallActive) return;

		if (isAudioOn) {
			av.realtimeUnmuteLocalAudio();
		} else {
			av.realtimeMuteLocalAudio();
		}
	}, [isAudioOn, isCallActive]);

	const teardownChime = async () => {
		const session = meetingSessionRef.current;
		if (!session) return;

		const av = session.audioVideo;
		const observer = chimeObserverRef.current;
		if (observer) {
			av.removeObserver(observer);
			chimeObserverRef.current = null;
		}

		try {
			if (av.hasStartedLocalVideoTile()) {
				av.stopLocalVideoTile();
			}
		} catch {
			/* noop */
		}

		await av.stopVideoInput().catch(() => {});
		await av.stopAudioInput().catch(() => {});

		// `audioVideo.stop()` does not return the promise from `stopReturningPromise()`.
		// Destroying the session before disconnect finishes clears EventController config while
		// async ingestion still reads `configuration.credentials` → TypeError.
		const audioVideoController = (
			session as unknown as {
				audioVideoController: { stopReturningPromise: () => Promise<void> };
			}
		).audioVideoController;
		await audioVideoController.stopReturningPromise().catch(() => {});

		await session.destroy().catch(() => {});
		meetingSessionRef.current = null;
		setHasRemoteVideo(false);
	};

	const stopBackendRecording = useCallback(async () => {
		if (!meetingRef.current.chime_media_pipeline_id) return;
		try {
			await stopMeetingRecording(meetingSlugRef.current);
		} catch {
			/* best-effort */
		}
	}, []);

	const handleRecordingClick = useCallback(async () => {
		if (recordingBusy) return;
		const pipelineActive = Boolean(meeting.chime_media_pipeline_id);
		setRecordingBusy(true);
		try {
			if (pipelineActive) {
				await stopMeetingRecording(meeting.slug);
			} else {
				await startMeetingRecording(meeting.slug);
			}
			const updated = await getMeeting(meeting.slug);
			setMeeting(updated);
		} catch (e) {
			const msg =
				e && typeof e === "object" && "msg" in e ? String((e as { msg: string }).msg) : "Recording request failed";
			showSnackBar({ message: msg, success: false });
		} finally {
			setRecordingBusy(false);
		}
	}, [recordingBusy, meeting.chime_media_pipeline_id, meeting.slug, showSnackBar]);

	const handleEndCall = async () => {
		await stopBackendRecording();
		await teardownChime();
		setIsCallActive(false);
		setIsMeetingEnd(true);
		try {
			const updated = await getMeeting(meeting.slug);
			setMeeting(updated);
		} catch {
			/* keep prior meeting state */
		}
	};

	const handleResume = async () => {
		await loadChimeSession();
		setIsMeetingEnd(false);
	};

	const handleJoin = async () => {
		if (!chimeSession || joining) return;

		setJoining(true);
		setHasRemoteVideo(false);

		try {
			const audioDevice = selectedDevices.audioinput ?? localStream?.getAudioTracks()[0]?.getSettings().deviceId;
			const videoDevice = selectedDevices.videoinput ?? localStream?.getVideoTracks()[0]?.getSettings().deviceId;

			stopLobbyPreview();

			const logger = new ConsoleLogger("PfpChime", LogLevel.WARN);
			const deviceController = new DefaultDeviceController(logger);
			const configuration = new MeetingSessionConfiguration(chimeSession.chime_meeting, chimeSession.attendee);
			const session = new DefaultMeetingSession(configuration, logger, deviceController);
			meetingSessionRef.current = session;

			const av = session.audioVideo;

			const audioDevices = await session.deviceController.listAudioInputDevices(true);
			const videoDevices = await session.deviceController.listVideoInputDevices(true);

			const resolvedAudio = audioDevice ?? audioDevices[0]?.deviceId;
			const resolvedVideo = videoDevice ?? videoDevices[0]?.deviceId;

			if (resolvedAudio === undefined || resolvedVideo === undefined) {
				throw new Error("No microphone or camera available for this visit.");
			}

			await av.startAudioInput(resolvedAudio);
			await av.startVideoInput(resolvedVideo);

			if (selectedDevices.audiooutput) {
				await av.chooseAudioOutput(selectedDevices.audiooutput);
			}

			const observer: AudioVideoObserver = {
				videoTileDidUpdate: (tileState) => {
					if (tileState.tileId === null || !tileState.boundAttendeeId) return;
					if (tileState.isContent) return;

					const localEl = localVideoRef.current;
					const remoteEl = remoteVideoRef.current;

					if (tileState.localTile) {
						if (localEl) {
							av.bindVideoElement(tileState.tileId, localEl);
						}
					} else if (remoteEl) {
						av.bindVideoElement(tileState.tileId, remoteEl);
						setHasRemoteVideo(true);
					}
				},
				videoTileWasRemoved: (tileId) => {
					av.unbindVideoElement(tileId, true);
					const remoteTiles = av.getAllRemoteVideoTiles();
					setHasRemoteVideo(remoteTiles.length > 0);
				},
			};

			chimeObserverRef.current = observer;
			av.addObserver(observer);

			av.start();

			if (isVideoOn) {
				av.startLocalVideoTile();
			}
			if (!isAudioOn) {
				av.realtimeMuteLocalAudio();
			}

			setIsCallActive(true);
		} catch (e) {
			console.error("Chime join failed:", e);
			const msg =
				e instanceof Error
					? e.message
					: e && typeof e === "object" && "message" in e
						? String((e as { message: unknown }).message)
						: "Could not join the visit";
			showSnackBar({ message: msg, success: false });
			await teardownChime();
			setLobbyMediaKey((k) => k + 1);
		} finally {
			setJoining(false);
		}
	};

	useEffect(() => {
		return () => {
			void (async () => {
				if (meetingRef.current.chime_media_pipeline_id) {
					try {
						await stopMeetingRecording(meetingSlugRef.current);
					} catch {
						/* best-effort */
					}
				}
				await teardownChime();
				stopLobbyPreview();
			})();
		};
	}, []);

	return !isCallActive ? (
		<MeetingLobby
			meeting={meeting}
			isVideoOn={isVideoOn}
			isAudioOn={isAudioOn}
			isMeetingEnd={isMeetingEnd}
			sessionLoading={sessionLoading}
			sessionError={sessionError}
			joinDisabled={!chimeSession || sessionLoading || !!sessionError || joining}
			toggleVideo={() => setIsVideoOn((prev) => !prev)}
			toggleAudio={() => setIsAudioOn((prev) => !prev)}
			onResume={handleResume}
			onJoin={handleJoin}
			stream={localStream}
			streamDevices={streamDevicesRef.current}
			selectedDevices={selectedDevices}
			onSelectDevice={(kind: MediaDeviceKind, device: MediaDeviceInfo["deviceId"]) => {
				setSelectedDevices((prev) => ({
					...prev,
					[kind]: device,
				}));
			}}
		/>
	) : (
		<div className="flex-1 flex flex-col h-full">
			<div className="grid grid-cols-9 h-full">
				<div className="flex-1 flex flex-col col-span-6 h-full">
					<MediaArea
						meeting={meeting}
						visitBeingRecorded={Boolean(meeting.chime_media_pipeline_id)}
						isVideoOn={isVideoOn}
						isAudioOn={isAudioOn}
						isCallActive={isCallActive}
						isScreenSharing={isScreenSharing}
						hasRemoteVideo={hasRemoteVideo}
						localVideoRef={localVideoRef}
						remoteVideoRef={remoteVideoRef}
						roomId={String(meeting.id ?? meeting.slug)}
						className="flex flex-1"
					/>
					<div className="p-4 flex flex-row  items-end ">
						<div className="flex items-center flex-1">
							<MediaControls
								isVideoOn={isVideoOn}
								isAudioOn={isAudioOn}
								onEndCall={() => void handleEndCall()}
								onToggleVideo={() => setIsVideoOn((prev) => !prev)}
								onToggleAudio={() => setIsAudioOn((prev) => !prev)}
								isRecording={Boolean(meeting.chime_media_pipeline_id)}
								recordingBusy={recordingBusy}
								onRecordingClick={() => void handleRecordingClick()}
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
