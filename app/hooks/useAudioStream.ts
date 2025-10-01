import { useEffect, useRef, useState } from "react";

export default function useAudioStream({
	emit,
	emitInterval = 5000,
	localStream,
	remoteStream,
	start = false,
}: {
	emit: (data: ArrayBuffer) => void;
	emitInterval?: number;
	localStream?: MediaStream | null;
	remoteStream?: MediaStream | null;
	start?: boolean;
}) {
	const audioContextRef = useRef<AudioContext>();
	const workletNodeRef = useRef<AudioWorkletNode>();
	const localSourceRef = useRef<MediaStreamAudioSourceNode>();
	const remoteSourceRef = useRef<MediaStreamAudioSourceNode>();
	const [workletNode, setWorkletNode] = useState<AudioWorkletNode>();
	const arrayBufferRef = useRef<Uint8Array[]>([]);
	const emitTimerRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		if (!start) return;

		const initializeAudio = async () => {
			if (workletNode) return;

			try {
				if (!audioContextRef.current || audioContextRef.current.state === "closed") {
					audioContextRef.current = new AudioContext({ sampleRate: 16000 });

					await audioContextRef.current.audioWorklet.addModule("/pcm-processor.js");
				}

				if (audioContextRef.current.state === "suspended") {
					await audioContextRef.current.resume();
				}

				const workletNode = new AudioWorkletNode(audioContextRef.current, "pcm-processor");

				workletNode.port.onmessage = (event) => {
					// console.log("Audio data captured:", event.data.byteLength, "bytes");
					// emit(event.data);
					arrayBufferRef.current.push(new Uint8Array(event.data));
				};

				setWorkletNode(workletNode);

				emitTimerRef.current = setInterval(() => {
					if (arrayBufferRef.current.length > 0) {
						const totalLength = arrayBufferRef.current.reduce((a, b) => a + b.length, 0);
						const merged = new Uint8Array(totalLength);
						let offset = 0;
						for (const chunk of arrayBufferRef.current) {
							merged.set(chunk, offset);
							offset += chunk.length;
						}
						arrayBufferRef.current = [];
						console.log("emit to backend!");
						emit(merged.buffer);
					}
				}, emitInterval);
			} catch (error) {
				console.error("Failed to initialize audio:", error);
			}
		};

		initializeAudio();
	}, [start, emit, emitInterval]);

	useEffect(() => {
		return () => {
			if (emitTimerRef.current) {
				clearInterval(emitTimerRef.current);
			}

			if (audioContextRef.current) {
				audioContextRef.current.close();
			}

			if (workletNode) {
				workletNode.disconnect();
				setWorkletNode(undefined);
			}
			if (localSourceRef.current) {
				localSourceRef.current.disconnect();
				localSourceRef.current = undefined;
			}
			if (remoteSourceRef.current) {
				remoteSourceRef.current.disconnect();
				remoteSourceRef.current = undefined;
			}
		};
	}, []);

	useEffect(() => {
		if (start) return;

		if (emitTimerRef.current) {
			clearInterval(emitTimerRef.current);
		}

		if (audioContextRef.current) {
			audioContextRef.current.close();
		}

		if (workletNode) {
			workletNode.disconnect();
			setWorkletNode(undefined);
		}
		if (localSourceRef.current) {
			localSourceRef.current.disconnect();
			localSourceRef.current = undefined;
		}
		if (remoteSourceRef.current) {
			remoteSourceRef.current.disconnect();
			remoteSourceRef.current = undefined;
		}
	}, [start]);

	useEffect(() => {
		if (!start) return;

		if (!localStream) return;

		if (!audioContextRef.current) return;

		if (!workletNode) return;

		if (localSourceRef.current) {
			localSourceRef.current.disconnect();
			localSourceRef.current = undefined;
		}

		try {
			localSourceRef.current = audioContextRef.current.createMediaStreamSource(localStream);
			localSourceRef.current.connect(workletNode);
		} catch (error) {
			console.error("Failed to connect local audio source:", error);
		}
	}, [localStream, start, workletNode]);

	useEffect(() => {
		if (!start) return;

		if (!remoteStream) return;

		if (!audioContextRef.current) return;

		if (!workletNode) return;

		if (remoteSourceRef.current) {
			remoteSourceRef.current.disconnect();
			remoteSourceRef.current = undefined;
		}

		try {
			remoteSourceRef.current = audioContextRef.current.createMediaStreamSource(remoteStream);
			remoteSourceRef.current.connect(workletNode);
		} catch (error) {
			console.error("Failed to connect remote audio source:", error);
		}
	}, [remoteStream, start, workletNode]);
}
