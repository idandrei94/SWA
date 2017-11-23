'use strict'

const PieceColour = {WHITE: "WHITE", BLACK: "BLACK"}

function pointWithinBoard(x,y) {
    return x>-1 && x<8 && y>-1 && y<8
}

class Piece { 
    constructor(x,y, value=0, colour, image) {
        if(this.constructor === Piece) {
            throw new Error("Unable to create a generic Piece object")
        }
        this.x = x
        this.y = y
        this.value = value
        this.colour = colour
        this.image = image
        this.enPassant = false
        this.hasMoved = false
        Object.defineProperty(this, 'value', {
            writable: false
        })
        Object.defineProperty(this, 'colour', {
            writable:false
        })
        Object.defineProperty(this, 'image', {
            writable:false
        })
    }
    
    move(x,y) {
        let newPiece = new this.constructor(x,y,this.colour)
        newPiece.hasMoved = this.x !== x || this.y !== y;
        if(this.type() === "Pawn" && Math.abs(x-this.x) === 2)
        {
            newPiece.enPassant = true
        }
        return newPiece
    }
    
    isAt(x,y) {
        return this.x===x && this.y===y
    }

    isCaptured() {
        return this.x === -1 || this.y === -1
    }

    type() {
        return "Piece"
    }

    isInDanger(pieces, x, y) {
        let tempBoard = pieces.filter(piece => piece!==this).concat([this.move(x,y)])
        return tempBoard.reduce((acc, piece) => {
            if(piece === this) {
                return acc
            }
            if(piece.colour === this.colour) {
                return acc
            }
            if(piece.getAvailableMoves(tempBoard, true).find(move=>move.X === x && move.Y === y) === undefined) {
                return acc
            }
            else return true
        }, false)
    }
}

class Pawn extends Piece {
    constructor(x, y, colour) {
        super(x,y,1,colour, colour==PieceColour.WHITE?"pieces/wp.png":"pieces/bp.png")
    }
    
    type() {
        return "Pawn"
    }

    getAvailableMoves(pieces) 
    {
        let direction = this.colour==PieceColour.WHITE?1:-1
        let startLine = this.colour==PieceColour.WHITE?1:6

        let enemiesInRange = pieces.filter(piece => piece.colour !== this.colour && 
                                                    (piece.isAt(this.x+direction, this.y-1) || 
                                                    piece.isAt(this.x+direction, this.y+1) ) )
        let attackableSquares = enemiesInRange.map(piece => {return {X:piece.x, Y:piece.y} })
        let enPassantSquares = pieces.filter(piece => piece.colour !== this.colour && 
                                                        piece.enPassant &&                      // En-passant only for 1 turn
                                                        (piece.isAt(this.x, this.y-1) ||        // after moving, controller      
                                                        piece.isAt(this.x, this.y+1) ) ).       // takes care of the flag
                                        map(piece => {return {X:piece.x+direction, Y:piece.y} })
        let frontSquare = pieces.find(piece=>piece.isAt(this.x+direction, this.y))
        if(frontSquare === undefined) {     // There's nothing in front
            if(!this.hasMoved && pieces.find(piece => piece.isAt(this.x+direction*2,this.y)) === undefined) 
            {                               // Can we move twice?
                return attackableSquares.
                    concat(enPassantSquares).
                    concat([{X:this.x+direction, Y:this.y}, {X:this.x+direction*2, Y:this.y}])
            }
            else {
                return attackableSquares.
                    concat(enPassantSquares).
                    concat([{X:this.x+direction, Y:this.y}])
            }
        }
        return attackableSquares.concat(enPassantSquares)
    }
}

class Rook extends Piece {
    constructor(x, y, colour) {
        super(x, y, 5, colour, colour==PieceColour.WHITE?"pieces/wr.png":"pieces/br.png")
    }
    
    type() {
        return "Rook"
    }

    getAvailableMoves(pieceList) {
        function checkLines(piece, x, y, directionX, directionY, pieces, arr) {
            let newX = x+directionX
            let newY = y+directionY
            if(!pointWithinBoard(newX, newY)) 
            {
                return arr
            }
            let findPiece = pieces.find(piece=>piece.isAt(newX, newY))
            if(findPiece === undefined) {
                if(pointWithinBoard(newX, newY)) 
                {
                    return checkLines(piece, newX, newY, directionX, directionY, pieces, arr.concat([{X:newX, Y:newY}]))
                }
                else 
                {
                    return arr
                }
            } 
            else if(findPiece.colour !== piece.colour) {
                return arr.concat([{X:newX, Y:newY}])
            }
            else {
                return arr
            }
        }
        let boardPieces = pieceList.filter(piece=>!piece.isCaptured())
        return checkLines(this, this.x, this.y, 0, 1, boardPieces,
            checkLines(this, this.x, this.y, 0,-1, boardPieces,
                checkLines(this, this.x, this.y, 1, 0, boardPieces,
                    checkLines(this, this.x, this.y, -1, 0, boardPieces, []))))
    }
}

class Knight extends Piece {
    constructor(x, y, colour) {
        super(x,y,3,colour, colour==PieceColour.WHITE?"pieces/wn.png":"pieces/bn.png")
    }
    
    type() {
        return "Knight"
    }

    getAvailableMoves(pieces) {
        let moves = [
            {X: this.x+2, Y: this.y+1},
            {X: this.x+2, Y: this.y-1},
            {X: this.x-2, Y: this.y+1},
            {X: this.x-2, Y: this.y-1},
            {X: this.x+1, Y: this.y+2},
            {X: this.x-1, Y: this.y+2},
            {X: this.x+1, Y: this.y-2},
            {X: this.x-1, Y: this.y-2}
        ]
        return moves.filter(move=> {
            let foundPiece = pieces.find(piece=>piece.isAt(move.X, move.Y))
            return pointWithinBoard(move.X, move.Y) && (foundPiece === undefined || foundPiece.colour !== this.colour)
        })
    }
}

class Bishop extends Piece {
    constructor(x, y, colour) {
        super(x,y,3,colour,colour==PieceColour.WHITE?"pieces/wb.png":"pieces/bb.png")
    }
    
    type() {
        return "Bishop"
    }

    getAvailableMoves(pieceList) {
        function checkLines(piece, x, y, directionX, directionY, pieces, arr) {
            let newX = x+directionX
            let newY = y+directionY
            if(!pointWithinBoard(newX, newY)) 
            {
                return arr
            }
            let findPiece = pieces.find(piece=>piece.isAt(newX, newY))
            if(findPiece === undefined) {
                if(pointWithinBoard(newX, newY)) 
                {
                    return checkLines(piece, newX, newY, directionX, directionY, pieces, arr.concat([{X:newX, Y:newY}]))
                }
                else 
                {
                    return arr
                }
            } 
            else if(findPiece.colour !== piece.colour) {
                return arr.concat([{X:newX, Y:newY}])
            }
            else {
                return arr
            }
        }
        let boardPieces = pieceList.filter(piece=>!piece.isCaptured())
        return checkLines(this, this.x, this.y, 1, 1, boardPieces,
            checkLines(this, this.x, this.y, -1,-1, boardPieces,
                checkLines(this, this.x, this.y, 1, -1, boardPieces,
                    checkLines(this, this.x, this.y, -1, 1, boardPieces, []))))
    }
}

class Queen extends Piece {
    constructor(x,y,colour) {
        super(x,y,10,colour,colour==PieceColour.WHITE?"pieces/wq.png":"pieces/bq.png")
    }
    
    type() {
        return "Queen"
    }

    getAvailableMoves(pieces) {
        let pieceList = pieces.filter(piece => piece !== this)
        let bishop = new Bishop(this.x, this.y, this.colour)
        let rook = new Rook(this.x, this.y, this.colour)
        return bishop.getAvailableMoves(pieceList.concat([bishop])).
        concat(rook.getAvailableMoves(pieceList.concat([rook])))
    }
}

class King extends Piece {
    constructor(x,y,colour) {
        super(x,y,0,colour,colour==PieceColour.WHITE?"pieces/wk.png":"pieces/bk.png")
    }
    
    type() {
        return "King"
    }

    getAvailableMoves(pieces, noCastle = false) {
        let activePieces = pieces.filter(piece=>!piece.isCaptured())                                                // We don't care about captured pieces
        let friendlyPieces = activePieces.filter(piece=>piece.colour==this.colour)

        var moves = [
            {X: this.x-1, Y: this.y-1},
            {X: this.x-1, Y: this.y},
            {X: this.x-1, Y: this.y+1},
            {X: this.x, Y: this.y-1},
            {X: this.x, Y: this.y+1},
            {X: this.x+1, Y: this.y-1},
            {X: this.x+1, Y: this.y},
            {X: this.x+1, Y: this.y+1}
        ].
            filter(move=>pointWithinBoard(move.X, move.Y)).                                                         // Exclude out of board moves
            filter(move=>friendlyPieces.find(piece=>piece.isAt(move.X, move.Y))===undefined)                        // Exclude positions occupied by friendly pieces
        if(!this.hasMoved && !noCastle)                                                                                         // King didn't move yet
        {
            let leftRookPos = this.colour==PieceColour.WHITE?{X:0, Y:0}:{X:7,Y:0}                                   // If the rooks are where
            let rightRookPos = this.colour==PieceColour.WHITE?{X:0, Y:7}:{X:7,Y:7}                                  // they're supposed to be
            let leftRook = pieces.find(piece=>piece.isAt(leftRookPos.X, leftRookPos.Y)&&!piece.hasMoved)            // And didn't move yet
            let rightRook = pieces.find(piece=>piece.isAt(rightRookPos.X, rightRookPos.Y)&&!piece.hasMoved)
            if(rightRook !== undefined && pieces.find(piece=>piece.isAt(this.x, this.y+1))===undefined&&            // If the way is clear
                pieces.find(piece=>piece.isAt(this.x, this.y+2))===undefined)                                       // If the destination is safe
            {                      
                if(!this.isInDanger(pieces, this.x, this.y) && 
                !this.isInDanger(pieces, this.x, this.y+1) && 
                !this.isInDanger(pieces, this.x, this.y+2))
                    {
                        moves.push({X:this.x,Y:this.y+2})
                    }
            }
            if(leftRook !== undefined && pieces.find(piece=>piece.isAt(this.x, this.y-1))===undefined&&
                pieces.find(piece=>piece.isAt(this.x, this.y-2))===undefined && 
                pieces.find(piece=>piece.isAt(this.x, this.y-3))===undefined) 
            {
                if(!this.isInDanger(pieces, this.x, this.y) && 
                    !this.isInDanger(pieces, this.x, this.y-1)&& 
                    !this.isInDanger(pieces, this.x, this.y-2))
                    {
                        moves.push({X:this.x,Y:this.y-2})
                    }
            }
        }
        return moves
    }
}

class Model {
    
    constructor() {
        this.pieces = []
        this.currentPlayer = PieceColour.WHITE
    } 

    getCurrentPlayer() {
        return this.currentPlayer
    }

    switchCurrentPlayer() {
        this.currentPlayer = this.currentPlayer === PieceColour.WHITE?PieceColour.BLACK:PieceColour.WHITE
    }

    addToHistory(move)
    {
        this.moves = this.moves + move
    }

    getHistory()
    {
        return this.moves
    }

    init() {
        this.moves = ""
        this.currentPlayer = PieceColour.WHITE
        return this.pieces = [
            new King(0,4,PieceColour.WHITE),
            new Queen(0,3,PieceColour.WHITE),
            new Bishop(0,2,PieceColour.WHITE),
            new Bishop(0,5,PieceColour.WHITE),
            new Knight(0,1,PieceColour.WHITE),
            new Knight(0,6,PieceColour.WHITE),
            new Rook(0,0,PieceColour.WHITE),
            new Rook(0,7,PieceColour.WHITE),
            new Pawn(1,4,PieceColour.WHITE),
            new Pawn(1,3,PieceColour.WHITE),
            new Pawn(1,2,PieceColour.WHITE),
            new Pawn(1,5,PieceColour.WHITE),
            new Pawn(1,1,PieceColour.WHITE),
            new Pawn(1,6,PieceColour.WHITE),
            new Pawn(1,0,PieceColour.WHITE),
            new Pawn(1,7,PieceColour.WHITE),
            new King(7,4,PieceColour.BLACK),
            new Queen(7,3,PieceColour.BLACK),
            new Bishop(7,2,PieceColour.BLACK),
            new Bishop(7,5,PieceColour.BLACK),
            new Knight(7,1,PieceColour.BLACK),
            new Knight(7,6,PieceColour.BLACK),
            new Rook(7,0,PieceColour.BLACK),
            new Rook(7,7,PieceColour.BLACK),
            new Pawn(6,4,PieceColour.BLACK),
            new Pawn(6,3,PieceColour.BLACK),
            new Pawn(6,2,PieceColour.BLACK),
            new Pawn(6,5,PieceColour.BLACK),
            new Pawn(6,1,PieceColour.BLACK),
            new Pawn(6,6,PieceColour.BLACK),
            new Pawn(6,0,PieceColour.BLACK),
            new Pawn(6,7,PieceColour.BLACK),
        ]
    }
}

module.exports = model
module.exports = PieceColour