// Evaluates a JS expression in the CrossForge renderer via CDP (stdin), or captures a screenshot.
// usage: <expr> | node scripts/cdp-eval.mjs
//        node scripts/cdp-eval.mjs --screenshot out.png
import fs from 'node:fs';

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? args[portIndex + 1] : '9222';
const screenshotIndex = args.indexOf('--screenshot');
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((target) => target.type === 'page' && target.title === 'CrossForge');
if (!page) {
  console.error('CrossForge target not found');
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let nextId = 1;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
};

function call(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

if (screenshotIndex >= 0) {
  const out = args[screenshotIndex + 1] ?? 'cdp-shot.png';
  const result = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(out, Buffer.from(result.result.data, 'base64'));
  console.log(`screenshot -> ${out}`);
} else {
  const expression = fs.readFileSync(0, 'utf8');
  const result = await call('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  console.log(JSON.stringify(result.result?.result?.value ?? result.result, null, 2));
}

ws.close();
