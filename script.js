const data = [],
	id = document.getElementById.bind(document),
	param = name => parseInt(new URLSearchParams(location.search).get(name));
let tileLength = 0,
	arg = param("length");
if (arg && !Number.isNaN(arg)) tileLength = arg;

while (tileLength < 5 || Number.isNaN(tileLength))
	tileLength = parseInt(prompt("Enter grid length (Minimum is 5)"));
const tileSize = Math.ceil((816 * 1.1) / tileLength),
	bombCount = tileLength ** 2 / 4;
var logs = ["Log will be printed here"];
const logElement = id("log");
const canvas = document.querySelector("canvas");
import { bot, guess } from "./bot.js";
canvas.height = tileSize * tileLength;
canvas.width = canvas.height;
window.addEventListener("error", e => log(e.error));
canvas.addEventListener("click", e => {
	reveal(Math.floor(e.offsetX / tileSize), Math.floor(e.offsetY / tileSize));
});
canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
	flag(Math.floor(e.offsetX / tileSize), Math.floor(e.offsetY / tileSize));
});
canvas.addEventListener("pointermove", e => {
	const x = Math.floor(e.offsetX / tileSize),
		y = Math.floor(e.offsetY / tileSize);
	if (x < 0 || y < 0 || x >= tileLength || y >= tileLength) return;
	id("coord").textContent = `${x}, ${y}, ${Object.keys(data[x][y])
		.filter(e => data[x][y][e] === true)
		.join(",")}`;
});
const ctx = canvas.getContext("2d");
const palette = {
	"0-0": "#44EE44",
	"1-0": "#55FF55",
	"0-1": "#F8D257",
	"1-1": "#FFE388",
	t2: "#1500BF",
	t3: "#DD0000",
	t4: "#A0002E",
	t5: "#FF0000",
	t6: "#870057",
};
const flagpng = new Image();
flagpng.src = "flag.png";

generate();
firstOpen();
function enable(e) {
	log("Starting AI");
	id("enable-ai").hidden = true;
	startTick();
	id("interval").hidden = false;
	id("interval-text").hidden = false;
}
id("enable-ai").addEventListener("click", enable);
if (param("ai")) enable();
//startTick();
// Add a rectangle at (10, 10) with size 100x100 pixels
//ctx.fillRect(10, 10, 100, 100);
function render() {
	const start = Date.now();
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bolder " + tileSize + "px arial";
	for (let x = 0; x < tileLength; x++) {
		for (let y = 0; y < tileLength; y++) {
			const d = data[x][y];
			const datp = !!d.p + "," + !!d.r + "," + !!d.f;
			if (d.p === datp) continue;
			d.p = datp;
			const colorId = (Math.floor((x + (y % 2)) % 2) === 0) * 1 + "-" + d.r * 1;
			//log(colorId);
			ctx.fillStyle = palette[colorId];
			ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			if (d.r && d.c !== 0) {
				ctx.fillStyle = palette["t" + d.c] || "black";
				ctx.fillText(`${d.c}`, (x + 0.5) * tileSize, (y + 0.5) * tileSize);
			} else if (d.f) {
				ctx.drawImage(flagpng, x * tileSize, y * tileSize, tileSize, tileSize);
			}
		}
	}
	log(`render ${Date.now() - start}ms`);
}

function flag(x, y) {
	if (data[x][y].r) return false;
	data[x][y].f = !data[x][y].f;
	log(`flag ${x}, ${y}, ${data[x][y].f}`);
	render();
	return true;
}
var ticked = false;
function putFlag(x, y) {
	if (data[x][y].r) return false;
	if (data[x][y].f) return false;
	data[x][y].f = true;
	log(`flag ${x}, ${y}, ${data[x][y].f}`);
	ticked = true;
	return true;
}

function reveal(x, y, top = true) {
	const d = data[x][y];
	if (d.r || d.f) return false;
	if (d.b) {
		generate();
		firstOpen();
		log("BOOM!");
		alert("BOOM!");
		return;
	}
	data[x][y].r = true;
	if (d.c === 0) iterateNeighbors(x, y, (x, y) => reveal(x, y, false));
	if (top) {
		log(`reveal ${x}, ${y}`);
		render();
	}
	return true;
}

function open(x, y, top = true) {
	const d = data[x][y];
	if (d.r || d.f) return false;
	if (d.b) {
		generate();
		firstOpen();
		throw new Error("dead");
	}
	data[x][y].r = true;
	if (d.c === 0) iterateNeighbors(x, y, (x, y) => reveal(x, y, false));
	if (top) {
		log(`reveal ${x}, ${y}`);
		ticked = true;
	}
	return true;
}
//minimal-function to find the best tile to open
function firstOpen() {
	const start = Date.now();
	while (true) {
		const x = Math.floor(Math.random() * tileLength);
		const y = Math.floor(Math.random() * tileLength);
		const d = data[x][y];
		if (!d.r && !d.b && !d.c) {
			reveal(x, y);
			break;
		}
	}
	log(`loaded ${Date.now() - start}ms`);
	return true;
}
//Functions below are mis-implemented, but later it will be used in AI implementation.
/*function reveal(x, y, top = true) {
  if (!checkIfCanReveal(x, y)) return false;
  data[x][y].r = true;
  iterateNeighbors(x, y, (x, y) => {
    checkIfCanReveal(x, y) && reveal(x, y, false);
  });
  log(`reveal ${x}, ${y}`);
  if (top) render();
  return true;
}

function checkIfCanReveal(x, y) {
  if (data[x][y].b || data[x][y].r || data[x][y].f) return false;
  let flagged = 0;
  iterateNeighbors(x, y, (x, y) => data[x][y].f && flagged++);
  return flagged === data[x][y].c;
}*/

function generate() {
	if (tileLength ** 2 < bombCount) return log("Not enough tiles");
	const start = Date.now();
	for (let x = 0; x < tileLength; x++) {
		data[x] = [];
		for (let y = 0; y < tileLength; y++) {
			//b = bomb, r = revealed, c = count, f = flagged, p = previous(concat of all keys, to prevent repeated rendering)
			data[x][y] = { b: false, r: false, c: 0, f: false, p: "" };
		}
	}
	for (let i = 0; i < bombCount; i++) {
		const x = Math.floor(Math.random() * tileLength);
		const y = Math.floor(Math.random() * tileLength);
		if (data[x][y].b) {
			i--;
			continue;
		}
		data[x][y].b = true;
		iterateNeighbors(x, y, (x, y) => {
			data[x][y].c++;
			//log(`${x}, ${y}, ${data[x][y].c}`);
		});
		//log(`bomb ${x}, ${y}`);
	}
	log(`generate ${Date.now() - start}ms`);
}

function iterateNeighbors(x, y, fn) {
	//dont include itself, 8 surrounding tiles
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			if (i === 0 && j === 0) {
				continue;
			}
			const nx = x + i;
			const ny = y + j;
			if (!data[nx]) continue;
			if (!data[nx][ny]) continue;
			fn(nx, ny);
		}
	}
}
function log(msg) {
	if (logs.length > 50) logs.pop();
	logs.unshift(msg);
	logElement.innerHTML = logs.join("<br>");
}

//Library for bot
export { iterateNeighbors, log, open, putFlag };
window.iterateNeighbors = iterateNeighbors;
var interval = param("interval") || 500;
id("interval").value = interval;
id("interval").addEventListener("change", e => (interval = e.target.value));
//bot-related functions
function startTick() {
	window.data = data.map(e =>
		e.map(e => (e.r ? { ...e, h: false } : { f: e.f, h: true }))
	);
	bot(window.data, log, open);
	if (ticked) {
		ticked = false;
		render();
	} else {
		guess(window.data);
	}
	if (ticked) render();
	/*if (ticks < 100) {
		ticks = 0;
		generate();
		render();
		firstOpen();
	}*/
	ticked = false;
	setTimeout(startTick, interval);
}
