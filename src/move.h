#ifndef MOVE_H
#define MOVE_H

#include <string>

#define NEW_MOVE(source, dest, castle, promote, isEp) (isEp | ((promote) << 1) | ((castle) << 4) | ((dest) << 6) | ((source) << 12))
#define SOURCE(move) (((move) >> 12) & 0b111111)
#define DEST(move) (((move) >> 6) & 0b111111)
#define CASTLE(move) (((move) >> 4) & 0b11)
#define PROMOTE(move) (((move) >> 1) & 0b111)
#define IS_EP(move) ((move) & 0b1)

#define NEW_FILL_MOVE(dest, piece) (piece | (dest << 6) | (1 << 21))
#define PIECE(move) ((move) & 0b1111)

#define IS_FILL(move) (((move) >> 21) & 0b1)

namespace move {
	struct Move {
		int source;
		int dest;
		int castle;
		int promote;
		bool isEp;

		int piece;
		bool isFill;
	};
	void print_move(int move, bool newLine);
	void make_move(bitboard::Position &board, int move);
	std::string make_move_for_JS(std::string fen, move::Move move);
}

#endif