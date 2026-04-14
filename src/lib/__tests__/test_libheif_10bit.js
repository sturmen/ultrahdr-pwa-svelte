import fs from 'fs';
import path from 'path';
import libheifFactory from 'libheif-js/libheif-wasm/libheif.js';

async function runTest() {
    const heif = await libheifFactory();
    
    // Find a sample HIF/HEIC file
    // To be safe let's just create a dummy HEIF or use one if it exists
    const testFilePath = '/Users/nicholastinsley/git/ultrahdr-pwa-svelte/fixtures/test_hdr_no_gain_map.HIF';
    if (!fs.existsSync(testFilePath)) {
        console.log("No test HIF found, test skipped.");
        return;
    }
    
    const buffer = fs.readFileSync(testFilePath);
    const decoder = new heif.HeifDecoder();
    const images = decoder.decode(buffer.buffer);
    
    if (images && images.length > 0) {
        const primary = images[0];
        console.log("Image width:", primary.get_width());
        
        // try to decode to 10-bit RGB
        try {
            const decoded = heif.heif_js_decode_image2(
                primary.handle, 
                heif.heif_colorspace.heif_colorspace_RGB, 
                heif.heif_chroma.heif_chroma_interleaved_32bit // Or 11 / 15 etc
            );
            console.log("js_decode_image2 returned:", typeof decoded);
            if (decoded && decoded.channels && decoded.channels.length > 0) {
                const c = decoded.channels[0];
                console.log("Channels:", {id: c.id, width: c.width, height: c.height, stride: c.stride, dataLen: c.data.length});
                
                // Let's look at the first few pixels of data
                const byteData = c.data;
                const view32 = new Uint32Array(byteData.buffer, byteData.byteOffset, byteData.length / 4);
                
                console.log("First 3 pixels (32-bit values):");
                for (let i = 0; i < 3; i++) {
                    const p = view32[i];
                    // standard a2r10g10b10 or r10g10b10a2?
                    const r = p & 0x3ff;
                    const g = (p >> 10) & 0x3ff;
                    const b = (p >> 20) & 0x3ff;
                    const a = (p >> 30) & 0x3;
                    console.log(`Pixel ${i}: 0x${p.toString(16).padStart(8, '0')} -> R:${r} G:${g} B:${b} A:${a}`);
                }
            }
        } catch (e) {
            console.error("heif_js_decode_image2 failed:", e);
        }
    }
}
runTest();
