const height = window.innerHeight ||
	document.getElementsByTagName("html")[0].clientHeight  ||
	document.getElementsByTagName("body")[0].clientHeight  ||
	screen.availHeight;

const SIZE = Math.floor(height * 0.08);

const DARK = "#b58863";
const LIGHT = "#f0d9b5";

const SEL_DARK = "#e0c434";
const SEL_LIGHT = "#f8ec5c";

const LAST_MOVE_DARK = "#aaa23a";
const LAST_MOVE_LIGHT = "#cdd26a";

decode("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 - -");

document.getElementById("fen").value = encode();

var freezeBoard = true;
var humanSide = false;

var rows = [];

var selected = null;
var sel1 = null;
var sel2 = null;

var moves = [];
var movesFromSelected = [];

var book = new Map();

const TIME = 1500;

var promotionSquare = -1;

function init() {
	document.getElementById("perft").onclick = () => window.location.href = "perft.html";

	let current = 0;
	document.getElementById("board").innerHTML = "";

	for (let i = 0; i < 2; i++) {
		rows[i] = document.createElement("tr");
		for (let j = 0; j < 8; j++) {
			const td = document.createElement("td");
			const div = document.createElement("div");

			div.id = `C${j + (1-i)*8}`;
			div.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; box-shadow: inset 0px 0px 0px 0.1em black;`);
			div.className = "square";
			div.onclick = () => reserveClick(div.id);

			td.append(div);
			rows[i].appendChild(td);
		}
	}

	for (let i = 2; i < 10; i++) {
		rows[i] = document.createElement("tr");
		for (let j = 0; j < 4; j++) {
			const td1 = document.createElement("td");
			const td2 = document.createElement("td");

			const light = document.createElement("div");

			let notation = XYToNotation(`${Math.floor(current / 8)}${current % 8}`);
			if (humanSide == true)
				notation = XYToNotation(`${Math.floor((63 - current) / 8)}${(63 - current) % 8}`);
			
			light.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${LIGHT};`);
			light.className = "square";
			light.id = notation.toString();
			light.onclick = () => click(parseInt(light.id));

			if (board[notation] > 0) {
				const image = document.createElement("img");
				image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
				image.src = `./Assets/${getImage(board[notation])}.png`;
				image.className = "piece";
				light.appendChild(image);
			}

			current++;

			const dark = document.createElement("div");

			notation = XYToNotation(`${Math.floor(current / 8)}${current % 8}`);
			if (humanSide == true)
				notation = XYToNotation(`${Math.floor((63-current) / 8)}${(63-current) % 8}`);
			dark.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${DARK};`);
			dark.className = "square";
			dark.id = notation.toString();
			dark.onclick = () => click(parseInt(dark.id));

			if (board[notation] > 0) {
				const image = document.createElement("img");
				image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
				image.src = `./Assets/${getImage(board[notation])}.png`;
				image.className = "piece";
				dark.appendChild(image);
			}

			current++;

			td1.append(light);
			td2.append(dark);

			rows[i].appendChild(td1);
			rows[i].appendChild(td2);
		}

		i++;

		rows[i] = document.createElement("tr");
		for (let j = 0; j < 4; j++) {
			const td1 = document.createElement("td");
			const td2 = document.createElement("td");

			const dark = document.createElement("div");

			let notation = XYToNotation(`${Math.floor(current / 8)}${current % 8}`);
			if (humanSide == true)
				notation = XYToNotation(`${Math.floor((63-current) / 8)}${(63-current) % 8}`);
			dark.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${DARK};`);
			dark.className = "square";
			dark.id = notation.toString();
			dark.onclick = () => {
				click(parseInt(dark.id));
			}
			if (board[notation] > 0) {
				const image = document.createElement("img");
				image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
				image.src = `./Assets/${getImage(board[notation])}.png`;
				image.className = "piece";
				dark.appendChild(image);
			}

			current++;

			const light = document.createElement("div");

			notation = XYToNotation(`${Math.floor(current / 8)}${current % 8}`);
			if (humanSide == true)
				notation = XYToNotation(`${Math.floor((63-current) / 8)}${(63-current) % 8}`);
			light.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${LIGHT};`);
			light.className = "square";
			light.id = notation.toString();
			light.onclick = () => {
				click(parseInt(light.id));
			}
			if (board[notation] > 0) {
				const image = document.createElement("img");
				image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
				image.src = `./Assets/${getImage(board[notation])}.png`;
				image.className = "piece";
				light.appendChild(image);
			}

			current++;

			td1.append(dark);
			td2.append(light);

			rows[i].appendChild(td1);
			rows[i].appendChild(td2);
		}
	}

	for (let i = 0; i < 2; i++) {
		rows[i + 10] = document.createElement("tr");
		for (let j = 0; j < 8; j++) {
			const td = document.createElement("td");
			const div = document.createElement("div");

			div.id = `P${j + i*8}`;
			div.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; box-shadow: inset 0px 0px 0px 0.1em black;`);
			div.className = "square";
			div.onclick = () => reserveClick(div.id);

			td.append(div);
			rows[i + 10].appendChild(td);
		}
	}

	for (let row of rows)
		document.getElementById("board")?.appendChild(row);

	document.getElementById("queen").onclick = () => {
		freezeBoard = false;
		board[promotionSquare] = getColor(board[promotionSquare]) ? PIECES.indexOf("q") : PIECES.indexOf("Q");
		document.getElementById("pgn").textContent += "=" + PIECES[board[promotionSquare]];
		update();
		computerMove();
		document.getElementById("promotion").removeAttribute("open");
		moves = moveGen();
	}
	document.getElementById("rook").onclick = () => {
		freezeBoard = false;
		board[promotionSquare] = getColor(board[promotionSquare]) ? PIECES.indexOf("r") : PIECES.indexOf("R");
		document.getElementById("pgn").textContent += "=" + PIECES[board[promotionSquare]];
		update();
		computerMove();
		document.getElementById("promotion").removeAttribute("open");
		moves = moveGen();
	}
	document.getElementById("bishop").onclick = () => {
		freezeBoard = false;
		board[promotionSquare] = getColor(board[promotionSquare]) ? PIECES.indexOf("b") : PIECES.indexOf("B");
		document.getElementById("pgn").textContent += "=" + PIECES[board[promotionSquare]];
		update();
		computerMove();
		document.getElementById("promotion").removeAttribute("open");
		moves = moveGen();
	}
	document.getElementById("knight").onclick = () => {
		freezeBoard = false;
		board[promotionSquare] = getColor(board[promotionSquare]) ? PIECES.indexOf("n") : PIECES.indexOf("N");
		document.getElementById("pgn").textContent += "=" + PIECES[board[promotionSquare]];
		update();
		computerMove();
		document.getElementById("promotion").removeAttribute("open");
		moves = moveGen();
	}

	document.getElementById("close").onclick = () => {
		document.getElementById("result").removeAttribute("open");
	}

	document.getElementById("resetFenInput").value = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
}
function update() {
	for (let piece of document.querySelectorAll(".highlight"))
		piece.remove();
	for (let piece of document.querySelectorAll(".piece"))
		piece.remove();
	for (let i = 0; i < 16; i++) {
		document.getElementById(`P${i}`).innerHTML = "";
		document.getElementById(`C${i}`).innerHTML = "";
	}

	for (let i = 0; i < 64; i++) {
		let notation = i;
		if (humanSide)
			notation = 63 - i;
		if (board[notation] <= 0)
			continue;

		const image = document.createElement("img");
		image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
		image.src = `./Assets/${getImage(board[notation])}.png`;
		image.className = "piece";
		document.getElementById(notation.toString())?.appendChild(image);
	}
	
	let white, black;
	if (humanSide) {
		white = "C";
		black = "P";
	}
	else {
		white = "P";
		black = "C";
	}

	for (let i = 0; i < whiteReserve.length; i++) {
		const image = document.createElement("img");
		image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
		image.src = `./Assets/${getImage(PIECES.indexOf(whiteReserve[i]))}.png`;
		image.className = "piece";
		document.getElementById(white + i).appendChild(image);
	}
	for (let i = 0; i < blackReserve.length; i++) {
		const image = document.createElement("img");
		image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px;`);
		image.src = `./Assets/${getImage(PIECES.indexOf(blackReserve[i]))}.png`;
		image.className = "piece";
		document.getElementById(black + i).appendChild(image);
	}
}

function click(current) {
	if (freezeBoard)
		return;

	if (selected == null) {
		if (board[current] > 0 && getColor(board[current]) == turn && getColor(board[current]) == humanSide) {
			document.getElementById(current.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(current) ? SEL_LIGHT : SEL_DARK}`);
			selected = current;
			movesFromSelected.length = 0;
			for (let move of moves) {
				if (move.source == current) {
					movesFromSelected.push(move);
					if (move.promote == 0 || move.promote == 5 || move.promote == 11) {
						const image = document.createElement("img");
						image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; opacity: 50%`);
						image.src = board[move.dest] > 0 ? "./Assets/capture.png" : "./Assets/highlight.png";
						image.className = "highlight";
						document.getElementById(move.dest.toString())?.appendChild(image);
					}
				}
			}
		}
		return;
	}

	if (current == selected)
		return;

	for (let move of movesFromSelected) {
		if (move.dest == current) {
			let promote = false;

			move.source = selected;
			if (move.promote != 0) {
				promote = true;
				move.promote = 0;
				freezeBoard = true;
				promotionSquare = move.dest;
				document.getElementById("promotion").setAttribute("open", "");
			}

			document.getElementById(selected.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; 
				background-color: ${isLight(selected) ? LIGHT : DARK}`);
			
			if (!turn) {
				document.getElementById("pgn").textContent += moveClock + ". " + moveToSAN(move);
				moveClock++;
			}
			else
				document.getElementById("pgn").textContent += " " + moveToSAN(move) + "\n";
			document.getElementById("pgn").scrollTop = document.getElementById("pgn").scrollHeight;
			

			decode(Module.makeMove(encode(), move));

			if (promote) {
				highlightLastMove(move);
				return;
			}

			let text = "";
			let gameEnd = false;
			if (fiftyMoveClock >= 50)  {
				text = "Draw by 50 move rule";
				gameEnd = true;
			}
			if (insufMat())  {
				text = "Draw by insufficient material";
				gameEnd = true;
			}
			if (gameEnd) {
				let paragraph = document.createElement("p");
				paragraph.textContent = text;
				
				let button = document.createElement("button");
				button.onclick = () => {
					result.removeAttribute("open");
				}
				button.textContent = "OK";

				result.append(paragraph);
				result.append(button);

				setTimeout(() => result.setAttribute("open", ""), 100);
			}

			document.getElementById("fen").value = encode();
			selected = null;

			highlightLastMove(move);

			update();
			movesFromSelected.length = 0;

			moves = moveGen();

			if (!promote)
				computerMove();

			return;
		}
	}

	if (selected[0] != "P")
		document.getElementById(selected.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(selected) ? LIGHT : DARK}`);
	else
		document.getElementById(selected.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; box-shadow: inset 0px 0px 0px 0.1em black`);
	
	for (let piece of document.querySelectorAll(".highlight"))
		piece.remove();

	if (board[current] > 0 && getColor(board[current]) == turn) {
		document.getElementById(current.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(current) ? SEL_LIGHT : SEL_DARK}`);
		selected = current;
		movesFromSelected.length = 0;
		for (let move of moves) {
			if (move.source == current) {
				movesFromSelected.push(move);
				if (move.promote == 0 || move.promote == 5 || move.promote == 11) {
					const image = document.createElement("img");
					image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; opacity: 50%`);
					image.src = board[move.dest] > 0 ? "./Assets/capture.png" : "./Assets/highlight.png";
					image.className = "highlight";
					document.getElementById(move.dest.toString())?.appendChild(image);
				}
			}
		}
	}
	else
		selected = null;
}

function reserveClick(current) {
	if (selected != null) {
		if (selected[0] != "P")
			document.getElementById(selected.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(selected) ? LIGHT : DARK}`);
		else
			document.getElementById(selected.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; box-shadow: inset 0px 0px 0px 0.1em black`);
		for (let piece of document.querySelectorAll(".highlight"))
			piece.remove();
	}

	let square = document.getElementById(current).children;
	if (square.length == 0 || current[0] == "C") 
		return;
	let piece = square[0].getAttribute("src").split("/").slice(-1)[0].replace(".png", "");
	let color = piece[0];
	piece = piece[1];
	if (color == "w")
		piece = piece.toUpperCase();

	document.getElementById(current)?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(current) ? SEL_LIGHT : SEL_DARK}`);
	selected = current;
	movesFromSelected.length = 0;
	for (let move of moves) {
		if (move.source == -1 && PIECES[move.piece] == piece) {
			movesFromSelected.push(move);
			const image = document.createElement("img");
			image.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; opacity: 50%`);
			image.src = "./Assets/highlight.png";
			image.className = "highlight";
			document.getElementById(move.dest.toString())?.appendChild(image);
		}
	}
}

function highlightLastMove(move) {
	if (sel1 != null) {

		// fix
		if (sel1[0] != "P")
			document.getElementById(sel1)?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; background-color: ${isLight(sel1) ? LIGHT : DARK}`);
		else
			document.getElementById(sel1)?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; box-shadow: inset 0px 0px 0px 0.1em black`);
		document.getElementById(sel2)?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; 
			background-color: ${isLight(sel2) ? LIGHT : DARK}`);
	}

	sel1 = move.source;
	sel2 = move.dest;

	document.getElementById(sel1.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; 
		background-color: ${isLight(sel1) ? LAST_MOVE_LIGHT : LAST_MOVE_DARK}`);
	document.getElementById(sel2.toString())?.setAttribute("style", `width: ${SIZE}px; height: ${SIZE}px; 
		background-color: ${isLight(sel2) ? LAST_MOVE_LIGHT : LAST_MOVE_DARK}`);
}

function initSidePicker() {
	document.getElementById("whiteButton").onclick = () => {
		freezeBoard = false;
		document.getElementById("color").removeAttribute("open");
		moves = moveGen();
		init();
		if (turn != humanSide)
			computerMove();
	}
	document.getElementById("blackButton").onclick = () => {
		humanSide = true;
		freezeBoard = false;
		document.getElementById("color").removeAttribute("open");
		moves = moveGen();
		init();
		if (turn != humanSide)
			computerMove();
	}

	document.getElementById("color").setAttribute("open", "");
}

document.getElementById("reset").onclick = () => {
	document.getElementById("resetInput").setAttribute("open", "");
	init();
	update();
}
document.getElementById("loadButton").onclick = () => {
	document.getElementById("pgn").textContent = "";
	if (turn) {
		document.getElementById("pgn").textContent = moveClock + "...";
		moveClock++;
	}

	let fen = document.getElementById("resetFenInput").value;
	if (!validFEN(fen)) {
		alert("Invalid FEN");
		return;
	}
	decode(fen);
	init();

	document.getElementById("depth").innerHTML = "<b>Depth: </b>"
	document.getElementById("eval").innerHTML = "<b>Eval: </b>"

	update();
	document.getElementById("resetInput").removeAttribute("open");

	initSidePicker();
}
document.getElementById("closeButton").onclick = () => {
	document.getElementById("resetInput").removeAttribute("open");
}
document.getElementById("pgn").setAttribute("style", `width: ${SIZE * 2.25}px; height: ${SIZE * 8 - 9}px;`);

init();
initSidePicker();
initOpeningBook();