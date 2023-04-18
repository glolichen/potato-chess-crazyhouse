#ifndef PERFT_H
#define PERFT_H

#include "bitboard.h"

namespace perft {
	struct PerftResult {
		std::string answer;
		int time;
	};
	PerftResult test(const std::string fen, int depth);
	ull perft(const bitboard::Position &board, int depth, bool first);
}

#endif
