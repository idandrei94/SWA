# Chessnut

Chessnut is a simple chess board model written in Python. It is *not* a chess engine and does not have AI or a GUI. However, it has the following features:
- Imports/exports games in Forsyth-Edwards Notation (FEN)
- Generates a list of legal moves for the current board position
- Intelligently validates & applies moves (including en passant, castling, etc.)
- Keeps track of the game with a history of both moves and corresponding FEN representation

Note that Chessnut is not written for speed, but for simplicity with only two classes and 200 lines of code. With a custom move evaluation function, it can be used as a chess engine. The simplicity of the model makes it suitable for studying the construction of a chess engine or for finding the set of legal moves for a particular chess board.

## Usage

To use Chessnut, import the `Game` class from the module:

```python
from Chessnut import Game
chessgame = Game()  # Initialize a game in the standard opening position
chessgame.get_moves()  # List of the 20 legal opening moves for white
chessgame.apply_move('e2e4')  # Advance the pawn from e2 to e4
chessgame.apply_move('e2e4')  # raises InvalidMove (no piece on e2)
