import * as ort from 'onnxruntime-web';
import fs from 'fs';
import path from 'path';

async function main() {
    const modelDir = path.resolve('./public/models');
    const realworld = path.join(modelDir, 'gmnet-realworld.onnx');
    const realworldInline = path.join(modelDir, 'gmnet-realworld-inline.onnx');

    console.log('Testing gmnet-realworld.onnx ...');
    try {
        const session = await ort.InferenceSession.create(realworld, {
            executionProviders: ['cpu'], // onnxruntime-node uses cpu/wasm differently, but let's test shape inference
        });
        console.log('SUCCESS: gmnet-realworld.onnx loaded.');
    } catch (e) {
        console.error('ERROR gmnet-realworld.onnx:', e.message);
    }

    console.log('\nTesting gmnet-realworld-inline.onnx ...');
    try {
        const sessionInline = await ort.InferenceSession.create(realworldInline, {
            executionProviders: ['cpu'],
        });
        console.log('SUCCESS: gmnet-realworld-inline.onnx loaded.');
    } catch (e) {
        console.error('ERROR gmnet-realworld-inline.onnx:', e.message);
    }
}

main().catch(console.error);
