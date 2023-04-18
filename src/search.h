#ifndef SEARCH_H
#define SEARCH_H

#include <string>
#include "bitboard.h"
#include "move.h"

namespace search {
	struct SearchResult {
		int move;
		int depth;
		int eval;
		bool mate_found;
	};

	int minimax(const bitboard::Position &board, int depth, int alpha, int beta, int depth_from_start);

	SearchResult search(std::string fen, int time_MS);

	bool eval_is_mate(int eval);
}

#endif
