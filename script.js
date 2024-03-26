const tileSize = 20,
  tileLength = 20,
  bombCount = 100;

var logs = ["Log will be printed here"];
const logElement = document.getElementById("log");
const canvas = document.querySelector("canvas");
window.addEventListener("error", (e) => log(e.error));
canvas.addEventListener("click", (e) => {
  reveal(Math.floor(e.offsetX / tileSize), Math.floor(e.offsetY / tileSize));
});
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  flag(Math.floor(e.offsetX / tileSize), Math.floor(e.offsetY / tileSize));
});
canvas.addEventListener("pointermove", (e) => {
  document.getElementById("coord").textContent =
    `${(x = Math.floor(e.offsetX / tileSize))}, ${(y = Math.floor(e.offsetY / tileSize))}`;
});
const ctx = canvas.getContext("2d");
const palette = {
  "0-0": "#44EE44",
  "1-0": "#55FF55",
  "0-1": "#F8D257",
  "1-1": "#FFE388",
};
var data = [];
const flagpng = new Image();
flagpng.src = "flag.png";

generate();
firstOpen();
// Add a rectangle at (10, 10) with size 100x100 pixels
//ctx.fillRect(10, 10, 100, 100);
function render() {
  const start = Date.now();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = tileSize + "px serif";
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
        ctx.fillStyle = "black";
        ctx.fillText(`${d.c}`, (x + 0.5) * tileSize, (y + 0.5) * tileSize);
      } else if (d.f) {
        ctx.drawImage(
          flagpng,
          (x + 0.5) * tileSize - 10,
          (y + 0.5) * tileSize - 10,
          tileSize,
          tileSize,
        );
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
}

function reveal(x, y, top = true) {
  const d = data[x][y];
  if (d.r || d.f) return false;
  if (d.b) {
    log("BOOM!");
    alert("BOOM!");
    return (
      (location.href = "https://www.youtube.com/watch?v=xvFZjo5PgG0") && false
    );
  }
  data[x][y].r = true;
  if (d.c === 0) iterateNeighbors(x, y, (x, y) => reveal(x, y, false));
  log(`reveal ${x}, ${y}`);
  if (top) render();
  return true;
}
//minimal-function to find the best tile to open
function firstOpen() {
  while (true) {
    const x = Math.floor(Math.random() * tileLength);
    const y = Math.floor(Math.random() * tileLength);
    const d = data[x][y];
    if (!d.r && !d.b && !d.c) {
      reveal(x, y);
      break;
    }
  }
  log(`Loaded.`);
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
