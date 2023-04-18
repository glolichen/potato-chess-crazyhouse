#ifndef BITBOARD_H
#define BITBOARD_H

#include <string>
#include <vector>

using ull = unsigned long long;
enum Color { WHITE, BLACK };
enum Pieces { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, ALL };

#define SET1(bitboard, pos) (bitboard |= 1ull << (pos))
#define SET0(bitboard, pos) (bitboard ^= 1ull << (pos))
#define QUERY(bitboard, pos) (bitboard >> (pos) & 1)

namespace bitboard {
	struct Position {
		ull all_pieces;
		ull pieces[2][7];
		int mailbox[64];

		bool turn;
		int en_passant;
		bool castle[4];

		int fifty_move_clock;
		int full_move;

		int reserve[2][6];
	};

	extern Position board;
	
	extern std::string squares[];
	extern std::string pieces;

	std::vector<std::string> split(std::string str, char split_on);

	void decode(std::string fen);
	std::string encode(const Position &board);

	void print_board(const Position &board);
}

#endif