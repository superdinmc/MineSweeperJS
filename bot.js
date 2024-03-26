//Bot system for it, not done yet

import { log, reveal } from "./script";

/**
 * @param {{r:Boolean,f:Boolean,c:Number,f:Boolean,p:String}[][]} data Data of the field, without unrevealed tiles.
 * @param {(String)=>void} log Logging function
 * @param {(x: Number, y: Number)=>Boolean} reveal Function to reveal a tile at x,y
 */
function bot(data) {
  log(JSON.stringify(data[25][26]));
  reveal(25, 26);
}

export default bot;
