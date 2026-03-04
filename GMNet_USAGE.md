GMNet is already designed so that, at inference time, the “local” branch (LCR) can run on a full-resolution SDR image while the “global” branch (GLE) runs on a fixed, downsampled view of the full SDR image for efficiency and global guidance.  ￼ The problem at 6000×4000 is not model validity, it’s memory/throughput: the LCR branch is a fully-convolutional feature extractor with ResBlock groups and produces a full-res normalized gain map.  ￼

A practical “full fidelity at 6000×4000” scaling approach is:
	1.	Keep the GM at full resolution (downscale ×1).

	•	The paper explicitly studies GM downsampling and shows quality degrades as downsampling increases (×2, ×4), while ×1 is best.  ￼
	•	Since you asked “full fidelity”, you want the ×1 setting (i.e., generate a full-res GM and only downsample later if you choose to for file-size reasons; the paper notes GM is “usually down-sampled” for file size, but that’s a tradeoff you can opt out of).  ￼

	2.	Run GLE once on the whole image, exactly as intended.

	•	In their implementation, the GLE input is reduced to 256×256.  ￼
	•	GLE produces (a) the scalar Qmax and (b) the global guidance tensors Wker (3×3×C) and Wchn (1×1×C).  ￼  ￼
	•	This is critical for tiled inference: you can reuse the same Wker/Wchn/Qmax for every tile, because they’re global-image statistics/guidance by design.

	3.	Tile only the LCR branch (the expensive part), with overlap and edge-safe padding.

	•	LCR is conv/ResBlock based, with an early stride=2 and a pixel-shuffle tail to reconstruct the normalized GM.  ￼
	•	That means LCR has a non-trivial receptive field; naïvely chopping into tiles causes seams because pixels near tile borders lack context.
	•	Use “overlap-tile and crop”:
	•	Choose a tile size that fits your target device (e.g., 1024–2048 on the long side).
	•	Add a halo/overlap margin (start with 64–128 px; increase if you still see seams).
	•	For each tile: pad (reflect padding works well), run LCR using the same Wker/Wchn from step (2), then crop away the halo and composite into the output canvas.
	•	Blend overlaps (e.g., cosine/linear feather) to eliminate any residual boundary mismatch.

	4.	Compose the final full-res GM exactly as GMNet defines it: IGM = INGM × Qmax.

	•	The network’s final GM is explicitly obtained by multiplying the LCR’s normalized GM output by the GLE’s Qmax.  ￼
	•	Implementation detail: compute INGM per tile, stitch into a full-res INGM, then multiply once by the scalar Qmax (or multiply per tile; identical result).

	5.	Use mixed precision + streaming to keep “full fidelity” while staying within memory.

	•	Fidelity here is dominated by (a) keeping GM at ×1 resolution and (b) avoiding tile seams; mixed precision (FP16) typically doesn’t change visual fidelity much for this kind of dense prediction but can dramatically reduce memory.
	•	If you’re targeting Core ML (as you mentioned previously), implement LCR as a tiled model execution (or run a single Core ML model on crops) and keep GLE as a separate small model that always runs on 256×256.

Concrete pipeline sketch:
	•	Preprocess:
	•	Convert SDR to the expected color space/range (the paper’s GM-ITM setup assumes SDR input and predicts log-encoded GM; you’ll match whatever your trained/exported GMNet expects).
	•	Global pass:
	•	Downsample SDR to 256×256 → run GLE → get Qmax, Wker, Wchn.  ￼  ￼
	•	Local pass (tiled):
	•	For y,x over 6000×4000 in tiles with overlap:
	•	Extract tile+halo → run LCR with Wker/Wchn guidance → output INGM tile → crop halo → blend into full-res INGM canvas.
	•	Post:
	•	IGM = INGM × Qmax.  ￼
	•	If you need a stored gain map at lower resolution (for ISO 21496-1 / UltraHDR style payload constraints), downsample after generating the full-res IGM, not before.

This preserves “full fidelity” in the sense supported by the paper: you’re not accepting the quality drop from GM downsampling (Table 6), and you’re respecting the model’s separation of global luminance estimation (one shot) from local contrast restoration (dense, expensive) by only tiling the latter.  ￼  ￼