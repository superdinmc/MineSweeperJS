//Bot system for it, not done yet

import { iterateNeighbors, log, open, putFlag } from "./script.js";
const flag = putFlag;

/**
 * @param {{r:Boolean,f:Boolean,c:Number,f:Boolean,p:String,h:Boolean}[][]} map Data of the field, without unrevealed tiles.
 */
function bot(map) {
	map.forEach((column, x) =>
		column.forEach((tile, y) => {
			if (tile.h) return;
			if (tile.c === 0) return;
			let count = 0,
				remaining = 0;
			iterateNeighbors(
				x,
				y,
				(x, y) =>
					((count += map[x][y].f) || 1) &&
					(remaining += !map[x][y].f && !map[x][y].r)
			);
			const score = tile.c - count;
			//console.log(x, y, count, score, remaining);
			map[x][y].fc = count;
			if (score === 0) {
				iterateNeighbors(x, y, (x, y) => open(x, y));
			} else {
				if (score === remaining) {
					iterateNeighbors(x, y, (x, y) => map[x][y].f || flag(x, y));
				}
			}
		})
	);
	//console.log(map);
}

/**
 * @param {{r:Boolean,f:Boolean,c:Number,f:Boolean,p:String,h:Boolean}[][]} map Data of the field, without unrevealed tiles.
 */
function guess(map) {
	map.every((column, x) =>
		column.every((tile, y) => {
			if (tile.h) return true;
			if (tile.c === 0) return true;
			let remaining = 0;
			iterateNeighbors(
				x,
				y,
				(x, y) => (remaining += !map[x][y].f && !map[x][y].r)
			);
			if (remaining > 0 && Math.random() > 0.8) {
				log(`guess ${x}, ${y}, ${remaining}`);
				var found = false;
				iterateNeighbors(x, y, (x, y) => {
					found || (found = flag(x, y));
				});
				return false;
			}
			return true;
		})
	);
}

export { bot, guess };

