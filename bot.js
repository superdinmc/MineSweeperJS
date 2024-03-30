//Bot system for it, not done yet

import { log, reveal, iterateNeighbors } from "./script.js";

/**
 * @param {{r:Boolean,f:Boolean,c:Number,f:Boolean,p:String}[][]} data Data of the field, without unrevealed tiles.
 * @param {(String)=>void} log Logging function
 * @param {(x: Number, y: Number)=>Boolean} reveal Function to reveal a tile at x,y
 */
function bot(data, log, reveal) {
  const map = structuredClone(data);
  map.forEach((column, x) =>
    column.forEach((tile, y) => {
      if (tile.h) return;
      let count = 0;
      iterateNeighbors(x, y, (t) => (count += t.f));
      const score = tile.c - count;
      map[x][y].fc = count;
      iterateNeighbors(x, y, () => (map[x][y].sc = score));
    }),
  );
  //console.log(map);
}

export default bot;
