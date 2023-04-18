const PIECES = " PNBRQKpnbrqk";
function getColor(piece) {
	return piece > 6;
}
function getImage(piece) {
	let color = getColor(piece) ? "b" : "w";
	let pieceImage = PIECES[piece].toLowerCase();
	return color + pieceImage;
}
