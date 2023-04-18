cmake_minimum_required(VERSION 3.0.0)
project(potato-chess-crazyhouse VERSION 0.1.0)

include(CTest)
enable_testing()

add_executable(potato-chess bitboard.cpp eval.cpp hash.cpp main.cpp maps.cpp move.cpp moveGen.cpp perft.cpp search.cpp)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
