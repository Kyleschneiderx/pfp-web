class PCMProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.frameCount = 0;
	}

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		this.frameCount++;

		if (input?.[0]) {
			const channelData = input[0]; // Float32Array [-1, 1]

			// Convert Float32 to Int16 PCM
			const buffer = new ArrayBuffer(channelData.length * 2);
			const view = new DataView(buffer);
			for (let i = 0; i < channelData.length; i++) {
				const s = Math.max(-1, Math.min(1, channelData[i]));
				view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			}

			// Send PCM chunk to main thread
			this.port.postMessage(buffer);
		}
		return true;
	}
}

registerProcessor("pcm-processor", PCMProcessor);
