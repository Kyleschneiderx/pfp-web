import { useCallback, useEffect, useRef, useState } from "react";

export default function useAudioStream({
	emit,
	emitLocal,
	emitRemote,
	emitInterval = 5000,
	localStream,
	remoteStream,
	start = false,
}: {
	emit?: (data: ArrayBuffer) => void;
	emitLocal?: (data: ArrayBuffer) => void;
	emitRemote?: (data: ArrayBuffer) => void;
	emitInterval?: number;
	localStream?: MediaStream | null;
	remoteStream?: MediaStream | null;
	start?: boolean;
}) {
	const audioContextRef = useRef<AudioContext>();
	const localSourceRef = useRef<MediaStreamAudioSourceNode>();
	const remoteSourceRef = useRef<MediaStreamAudioSourceNode>();
	const [workletNode, setWorkletNode] = useState<AudioWorkletNode>();
	const [localWorkletNode, setLocalWorkletNode] = useState<AudioWorkletNode>();
	const [remoteWorkletNode, setRemoteWorkletNode] = useState<AudioWorkletNode>();
	const arrayBufferRef = useRef<Uint8Array[]>([]);
	const localBufferRef = useRef<Uint8Array[]>([]);
	const remoteBufferRef = useRef<Uint8Array[]>([]);
	const emitTimerRef = useRef<NodeJS.Timeout>();

	const onEmit = useCallback((buffer: Uint8Array[], send: (data: ArrayBuffer) => void) => {
		if (buffer.length <= 0) return;

		const totalLength = buffer.reduce((a, b) => a + b.length, 0);
		const merged = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of buffer) {
			merged.set(chunk, offset);
			offset += chunk.length;
		}
		send(merged.buffer);
	}, []);

	const intervalEmit = () => {
		if (emit) {
			onEmit(arrayBufferRef.current, emit);
			arrayBufferRef.current = [];
		}

		if (emitLocal) {
			onEmit(localBufferRef.current, emitLocal);
			localBufferRef.current = [];
		}

		if (emitRemote) {
			onEmit(remoteBufferRef.current, emitRemote);
			remoteBufferRef.current = [];
		}
	};

	const initializeWorklets = () => {
		if (!audioContextRef.current) return;

		const workletNode = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
		workletNode.port.onmessage = (event) => {
			arrayBufferRef.current.push(new Uint8Array(event.data));
		};
		setWorkletNode(workletNode);

		const localWorkletNode = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
		localWorkletNode.port.onmessage = (event) => {
			localBufferRef.current.push(new Uint8Array(event.data));
		};
		setLocalWorkletNode(localWorkletNode);

		const remoteWorkletNode = new AudioWorkletNode(audioContextRef.current, "pcm-processor");
		remoteWorkletNode.port.onmessage = (event) => {
			remoteBufferRef.current.push(new Uint8Array(event.data));
		};
		setRemoteWorkletNode(remoteWorkletNode);
	};

	const cleanup = () => {
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

		if (localWorkletNode) {
			localWorkletNode.disconnect();
			setLocalWorkletNode(undefined);
		}

		if (remoteWorkletNode) {
			remoteWorkletNode.disconnect();
			setRemoteWorkletNode(undefined);
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

				initializeWorklets();

				if (emit || emitLocal || emitRemote) {
					emitTimerRef.current = setInterval(intervalEmit, emitInterval);
				}
			} catch (error) {
				console.error("Failed to initialize audio:", error);
			}
		};

		initializeAudio();
	}, [start, emit, emitInterval]);

	useEffect(() => {
		if (start) return;

		intervalEmit();

		cleanup();
	}, [start]);

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, []);

	useEffect(() => {
		if (!start) return;

		if (!localStream) return;

		if (!audioContextRef.current) return;

		if (localSourceRef.current) {
			localSourceRef.current.disconnect();
			localSourceRef.current = undefined;
		}

		try {
			localSourceRef.current = audioContextRef.current.createMediaStreamSource(localStream);

			if (workletNode) {
				localSourceRef.current.connect(workletNode);
			}

			if (localWorkletNode) {
				localSourceRef.current.connect(localWorkletNode);
			}
		} catch (error) {
			console.error("Failed to connect local audio source:", error);
		}
	}, [localStream, start, localWorkletNode]);

	useEffect(() => {
		if (!start) return;

		if (!remoteStream) return;

		if (!audioContextRef.current) return;

		if (remoteSourceRef.current) {
			remoteSourceRef.current.disconnect();
			remoteSourceRef.current = undefined;
		}

		try {
			remoteSourceRef.current = audioContextRef.current.createMediaStreamSource(remoteStream);
			if (workletNode) {
				remoteSourceRef.current.connect(workletNode);
			}

			if (remoteWorkletNode) {
				remoteSourceRef.current.connect(remoteWorkletNode);
			}
		} catch (error) {
			console.error("Failed to connect remote audio source:", error);
		}
	}, [remoteStream, start, remoteWorkletNode]);
}
