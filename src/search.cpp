#include <chrono>
#include <cstring>
#include <iostream>
#include <limits.h>
#include <map>
#include <tuple>
#include <vector>

#include "bitboard.h"
#include "eval.h"
#include "hash.h"
#include "maps.h"
#include "moveGen.h"
#include "search.h"

#define DELTA_CUTOFF 900

const int SEARCH_EXPIRED = INT_MIN + 500;

bool top_move_null;
int bestMove;
std::map<std::tuple<ull, ull, ull>, int> transposition;

ull limit;

// algorithm from: https://www.chessprogramming.org/Quiescence_Search
int quiescence(const bitboard::Position &board, int alpha, int beta) {
	int eval = eval::evaluate(board) * (board.turn ? -1 : 1);

	if (eval >= beta)
		return beta;

	// if (is pawn promotion)

	if (alpha <= INT_MIN + 1 && alpha >= INT_MAX - 1 && eval < alpha - DELTA_CUTOFF)
		return alpha;

	alpha = std::max(eval, alpha);
	
	std::vector<int> moves;
	moveGen::move_gen_with_ordering(board, moves);

	for (const int &move : moves) {
		if (board.mailbox[DEST(move)] == -1)
			continue;

		bitboard::Position new_board;
		memcpy(&new_board, &board, sizeof(board));
		move::make_move(new_board, move);

		int score = -quiescence(new_board, -beta, -alpha);

		alpha = std::max(score, alpha);
		if (score >= beta)
			return beta;
	}

	return alpha;
}

int search::minimax(const bitboard::Position &board, int depth, int alpha, int beta, int depth_from_start) {
	//check if we have reached the time limit and should end the search
	ull now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	if (now >= limit)
		return SEARCH_EXPIRED;

	if (depth == 0) {
		return quiescence(board, alpha, beta) * (board.turn ? -1 : 1);
		// return eval::evaluate(board);
	}

	if (board.fifty_move_clock >= 50)
		return 0;

	std::vector<int> moves;
	moveGen::move_gen_with_ordering(board, moves);

	// place the previous best move to the top of the list
	// this should speed up alpha-beta pruning by allowing us to prune most branches
	if (depth_from_start == 0 && !top_move_null) {
		for (int i = 0; i < moves.size(); i++) {
			if (moves[i] == bestMove) {
				moves.erase(moves.begin() + i);
				break;
			}
		}
		moves.insert(moves.begin(), bestMove);
	}

	if (moves.size() == 0) { // check whether there are legal moves
		if (moveGen::get_checks(board, board.turn)) {
			int multiply = board.turn ? 1 : -1;
			return INT_MAX * multiply - multiply * depth_from_start; // checkmate
		}
		return 0;
	}

	std::tuple<ull, ull, ull> hashes = hash::hash(board);
	if (transposition.count(hashes)) {
		int hash_move = transposition.at(hashes);
		for (int i = 0; i < moves.size(); i++) {
			if (moves[i] == hash_move) {
				moves.erase(moves.begin() + i);
				moves.insert(moves.begin(), hash_move);
				break;
			}
		}
	}

	int evaluation = board.turn ? INT_MAX : INT_MIN;
	int top_move;

	for (const int &move : moves) {
		bitboard::Position new_board;
		memcpy(&new_board, &board, sizeof(board));
		if (board.mailbox[DEST(move)] != -1 || board.mailbox[SOURCE(move)] == PAWN || board.mailbox[SOURCE(move)] == PAWN + 6)
			new_board.fifty_move_clock = 0;
		else
			new_board.fifty_move_clock++;
		move::make_move(new_board, move);

		int cur_eval = search::minimax(new_board, depth - 1, alpha, beta, depth_from_start + 1);
		if (cur_eval == SEARCH_EXPIRED)
			return SEARCH_EXPIRED;

		if (!board.turn) { // white
			if (cur_eval > evaluation) {
				evaluation = cur_eval;
				top_move = move;
			}

			alpha = std::max(cur_eval, alpha);
			if (beta <= alpha)
				break;
		}
		else { // black
			if (cur_eval < evaluation) {
				evaluation = cur_eval;
				top_move = move;
			}

			beta = std::min(cur_eval, beta);
			if (beta <= alpha)
				break;
		}
	}

	if (transposition.count(hashes) == 0)
		transposition.insert({ hashes, top_move });

	if (depth_from_start == 0)
		bestMove = top_move;

	return evaluation;
}

search::SearchResult search::search(std::string fen, int time_MS) {
	//iterative deepening
	//search with depth of one ply first
	//then increase depth until time runs out
	//if time runs out in the middle of a search, terminate the search
	//and use the result from the previous search

	//it may seem like that the program is wasting a lot of time searching previously searched positions
	//but we can use alpha and beta values from before to speed up pruning
	//and we can search the best move first in the deeper search
	//transposition table is still intact which means that we can still use alpha and beta values from before

	bitboard::decode(fen);

	top_move_null = true;

	eval::init();
	hash::init();
	maps::init();

	std::pair<int, int> best;
	limit = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	limit += time_MS;

	int depth = 1;
	bool is_mate = false;

	// for (; depth <= 1; depth++) {
	for (; depth <= 100; depth++) {
		int eval = search::minimax(bitboard::board, depth, INT_MIN, INT_MAX, 0);
		top_move_null = false;

		if (eval == SEARCH_EXPIRED) {
			depth--;
			break;
		}

		best.first = bestMove;
		best.second = eval;

		if (eval_is_mate(eval)) { // checkmate has been found, do not need to search any more
			is_mate = true;
			break;
		}
	}

	transposition.clear();


	// std::cout << PIECE(best.second) << "\n";


	return { best.first, depth, best.second, is_mate };
}

bool search::eval_is_mate(int eval) {
	return (eval > INT_MAX - 250) || (eval < INT_MIN + 250);
}
