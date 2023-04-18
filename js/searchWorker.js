onmessage = e => {
	importScripts("./engine.js");
	importScripts("./pieces.js");
	importScripts("./move.js");

	Module["onRuntimeInitialized"] = () => {	
		let out = Module.search(e.data[0], e.data[1]);
		postMessage([convert(out.move), out.depth, out.eval, out.mateFound]);
	};
}

var squares = [
	0,  1,  2,  3,  4,  5,  6,  7,
	8,  9,  10, 11, 12, 13, 14, 15,
	16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27, 28, 29, 30, 31,
	32, 33, 34, 35, 36, 37, 38, 39,
	40, 41, 42, 43, 44, 45, 46, 47,
	48, 49, 50, 51, 52, 53, 54, 55,
	56, 57, 58, 59, 60, 61, 62, 63,
];

function convert(move) {
	let isFill = ((move >> 21) & 0b1);
	let dest = squares[63 - ((move >> 6) & 0b111111)];

	if (isFill) {
		let piece = ((move) & 0b1111) + 1;
		return new Move(-1, dest, 0, 0, 0, piece, 1);
	}
	else {
		let source = squares[63 - ((move >> 12) & 0b111111)];
		let castle = (move >> 4) & 0b11
		let promote = (move >> 1) & 0b111;
		let isEp = (move) & 0b1;
		return new Move(source, dest, castle, promote, isEp, 0, 0);
	}
}