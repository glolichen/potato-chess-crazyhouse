const error = document.getElementById("error");

document.getElementById("back").onclick = () => window.location.replace("./index.html");

console.clear();

var shown = false;
var running = false;

document.getElementById("startButton").onclick = () => {
	if (running)
		return;

	let fen = document.getElementById("fenInput").value;
	let rawDepth = document.getElementById("depthInput").value;

	if (fen == "") {
		error.textContent = "Enter a FEN";
		clear();
		return;
	}

	if (rawDepth == "") {
		error.textContent = "Specify a depth";
		clear();
		return;
	}

	let depth = parseInt(rawDepth);
	if (depth <= 0) {
		error.textContent = "Depth cannot be less than 0";
		clear();
		return;
	}
	if (depth > 9) {
		error.textContent = "Depth cannot be larger than 9";
		clear();
		return;
	}

	if (!validFEN(fen)) {
		error.textContent = "Invalid FEN";
		clear();
		return;
	}

	error.textContent = "";
	clear();

	document.getElementById("count").textContent = "Working...";

	const worker = new Worker("./js/perftWorker.js");
	running = true;
	worker.postMessage([fen, depth]);
	worker.onmessage = e => {
		running = false;
		document.getElementById("count").textContent = `Total nodes: ${e.data.answer}`;
		document.getElementById("time").textContent = `Time taken: ${e.data.time}ms`;
		document.getElementById("nps").textContent = `Nodes per second: ${Math.round(e.data.answer / (e.data.time / 1000))}`;
	}
}

function clear() {
	console.clear();
	document.getElementById("count").textContent = "";
	document.getElementById("time").textContent = "";
	document.getElementById("nps").textContent = "";
	document.getElementById("toggleButton")?.remove();
	document.getElementById("breakdown")?.remove();
}

