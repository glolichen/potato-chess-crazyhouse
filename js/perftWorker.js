onmessage = e => {
	importScripts("./board.js");
	importScripts("./engine.js");
	Module["onRuntimeInitialized"] = () => {
		let out = Module.perft(e.data[0], e.data[1]);
		postMessage(out);
	};
}

function notationToXY(coord) {
	coord -= 26;
	coord -= Math.floor(coord / 12) * 4;

	let x = Math.floor(coord / 8).toString();
	let y = (coord % 8).toString();

	return x + y;
}

function moveToString(source, dest, promote) {
	let sourceAfter = notationToXY(source);
	let destAfter = notationToXY(dest);
	
	let ox = FILES[NUMBERS.indexOf(sourceAfter[1])];
	let oy = (8 - parseInt(sourceAfter[0])).toString();

	let nx = FILES[NUMBERS.indexOf(destAfter[1])];
	let ny = (8 - parseInt(destAfter[0])).toString();

	let result = ox + oy + nx + ny;

	if (promote != 0)
		result += String.fromCharCode(promote);

	return result;
}