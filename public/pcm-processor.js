class PCMProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.frameCount = 0;
	}

	process(inputs, outputs, parameters) {
		const input = inputs[0];

		if (input?.[0]) {
			const channelCount = input.length;
			const frameCount = input[0].length;

			// Mix all channels into one mono channel
			const monoData = new Float32Array(frameCount);

			for (let c = 0; c < channelCount; c++) {
				const channelData = input[c];
				for (let i = 0; i < frameCount; i++) {
					monoData[i] += channelData[i] / channelCount;
				}
			}

			// Convert Float32 to Int16 PCM
			const buffer = new ArrayBuffer(monoData.length * 2);
			const view = new DataView(buffer);
			for (let i = 0; i < monoData.length; i++) {
				const s = Math.max(-1, Math.min(1, monoData[i]));
				view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			}

			// Send PCM chunk to main thread
			this.port.postMessage(buffer);
		}

		this.frameCount++;
		return true;
	}
}

registerProcessor("pcm-processor", PCMProcessor);
