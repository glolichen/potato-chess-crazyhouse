#include <tuple>
#include <random>

#include "bitboard.h"
#include "hash.h"

ull zobrist_tables[3][64][12];

void hash::init() {
	for (int i = 0; i < 3; i++) {
		std::random_device rd;
		std::mt19937_64 random(rd());
		std::uniform_int_distribution<ull> distribution;

		for (int j = 0; j < 64; j++) {
			for (int k = 0; k < 12; k++)
				zobrist_tables[i][j][k] = distribution(random);
		}
	}
}

std::tuple<ull, ull, ull> hash::hash(const bitboard::Position &board) {
	ull hash1 = 0;
	ull hash2 = 0;
	ull hash3 = 0;
	ull *hash_locations[3] = { &hash1, &hash2, &hash3 };

	for (int i = 0; i < 3; i++) {
		ull pieces = board.all_pieces;
		while (pieces) {
			int pos = __builtin_ctzll(pieces);
			int piece = board.mailbox[pos];
			if (piece != -1)
				*(hash_locations[i]) ^= zobrist_tables[i][pos][piece];
			SET0(pieces, pos);
		}
	}
	
	return { hash1, hash2, hash3 };
}
