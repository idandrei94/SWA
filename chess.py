#!/usr/bin/python3.5
from random import randint
from Chessnut import Game
import subprocess
import cgitb
import cgi
cgitb.enable()

print("Content-Type: text/html")
print()
board = Game()
moves = ""
arg_moves = []
#try:
# arg = cgi.FieldStorage()['history']
# arg_moves = arg.value.split(' ')
#except:
# pass
#for move in arg_moves:
# try:
#  board.apply_move(move.strip())
#  moves = moves + " " + move
# except:
#  pass
arg = cgi.FieldStorage()['history']
arg_moves = arg.value.split(' ')
for move in arg_moves:
 board.apply_move(move.strip())

available_moves = board.get_moves()
chosen_move = available_moves[randint(0, len(available_moves)-1)]
moves = moves + " " + chosen_move
print(chosen_move)
