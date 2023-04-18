#include <iostream>
#include <tuple>

#include "bitboard.h"
#include "eval.h"
#include "maps.h"
#include "move.h"
#include "moveGen.h"
#include "perft.h"
#include "search.h"

#ifdef __EMSCRIPTEN__
	#include <vector>
	#include <emscripten/bind.h>
	using namespace emscripten;
	EMSCRIPTEN_BINDINGS(module) {
		function("getAttacked", &moveGen::get_checks_for_JS);
		function("makeMove", &move::make_move_for_JS);
		function("moveGen", &moveGen::move_gen_for_JS);
		function("perft", &perft::test);
		function("search", &search::search);
		value_object<move::Move>("Move")
			.field("source", &move::Move::source)
			.field("dest", &move::Move::dest)
			.field("castle", &move::Move::castle)
			.field("promote", &move::Move::promote)
			.field("isEp", &move::Move::isEp)
			.field("piece", &move::Move::piece)
			.field("isFill", &move::Move::isFill);
		value_object<perft::PerftResult>("PerftResult")
			.field("answer", &perft::PerftResult::answer)
			.field("time", &perft::PerftResult::time);
		value_object<search::SearchResult>("SearchResult")
			.field("move", &search::SearchResult::move)
			.field("depth", &search::SearchResult::depth)
			.field("eval", &search::SearchResult::eval)
			.field("mateFound", &search::SearchResult::mate_found);
		register_vector<int>("IntVector");
		register_vector<move::Move>("MoveVector");
	}
#else
	int main() {
		maps::init();
		eval::init();

		// bitboard::decode("rnbqkbnr/ppp2ppp/3p4/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 4 P -");

		// // move::make_move(bitboard::board, 149184);
		// // bitboard::print_board(bitboard::board);

		// // bitboard::board.turn = BLACK;

		// // move::make_move(bitboard::board, 2098566);
		// // bitboard::print_board(bitboard::board);

		// std::vector<int> moves;
		// moveGen::move_gen(bitboard::board, moves);
		// for (int move : moves) {
		// 	std::cout << move << ", ";
		// 	move::print_move(move, 1);
		// }


		// bitboard::print_board(bitboard::board);

		// auto search = search::search("rnbqkb1r/ppp1pppp/3P4/3n4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 5 - -", 3000);
		// move::print_move(search.move, true);
		// std::cout << search.depth;

		bitboard::decode("rn2kbnr/pp2pppp/2p5/8/3P4/2N2B2/PPP2PPq/R1BQK2R w KQkq - 0 8P");

		std::vector<int> moves;
		moveGen::move_gen(bitboard::board, moves);
		for (int move : moves) {
			std::cout << move << ", ";
			move::print_move(move, 1);
		}
		std::cout << moves.size();
		// move::make_move(bitboard::board, 2097856);

		// bitboard::print_board(bitboard::board);

		// perft::perft(bitboard::board, 2, true);

		return 0;
	}
#endif
