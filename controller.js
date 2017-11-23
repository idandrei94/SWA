//TODO: game status (draw - 50 moves, not enough pieces)
const GameStatus = {
    NORMAL: "Normal",
    CHECK: "Check",
    DRAW: "Draw",
    CHECKMATE: "Checkmate",
    TRANSFORM: "Transform"
}

const PieceType = {
    QUEEN: "QUEEN",
    ROOK: "ROOK",
    KNIGHT: "KNIGHT",
    BISHOP: "BISHOP"
}

class Controller {

    constructor(model) {
        this.model = model
        this.drawCount = 0
    }

    checkDraw() {
        return this.drawCount > 50
    }

    checkTransform() {
        let transformPawn = this.model.pieces.find(piece=>piece.type() === "Pawn" && (piece.x === 0 || piece.x === 7))
        return transformPawn !== undefined
    }

    getStatus() {
        let king = this.model.pieces.find(piece=>piece.type() === "King" && piece.colour === this.model.getCurrentPlayer())
        let myPieces = this.model.pieces.filter(piece=>piece.colour===this.model.getCurrentPlayer())
        let myMovesCount = myPieces.map(piece=>
                    piece.getAvailableMoves(this.model.pieces).map(move=>{return {x:7-move.X, y:move.Y}}).
                    filter(move => (this.isMoveSafe(piece, move.x, move.y)))).reduce((acc, moves)=>acc+moves.length, 0)
        if(this.checkTransform())
        {
            return GameStatus.TRANSFORM
        }
        else if(king.isInDanger(this.model.pieces, king.x, king.y)) {               // Test for check
            if(myMovesCount === 0) {                                                // Test for checkmate
                return GameStatus.CHECKMATE
            }
            else {
                return GameStatus.CHECK
            }
        }
        else if(this.checkDraw() || myMovesCount === 0) 
        {
            return GameStatus.DRAW
        }
        else {
            return GameStatus.NORMAL
        }
    }

    transform(type) {
        this.model.switchCurrentPlayer()
        let transformPawn = this.model.pieces.find(piece=>piece.type() === "Pawn" && (piece.x === 0 || piece.x === 7))
        return (this.model.pieces = this.model.pieces.map(piece=>
            {
                if(piece === transformPawn)
                   switch(type) {
                    case PieceType.QUEEN:
                        this.controller.addToHistory('q')
                        return new Queen(piece.x, piece.y, piece.colour)
                    case PieceType.ROOK:
                    this.controller.addToHistory('r')
                        return new Rook(piece.x, piece.y, piece.colour)
                    case PieceType.KNIGHT:
                    this.controller.addToHistory('n')
                        return new Knight(piece.x, piece.y, piece.colour)
                    case PieceType.BISHOP:
                    this.controller.addToHistory('b')
                        return new Bishop(piece.x, piece.y, piece.colour)
                   } 
                else return piece
            })).
            map(piece => {return {x:7-piece.x, y:piece.y, isCaptured:piece.isCaptured(), src:piece.image}})
    }

    getCurrentPlayer() {
        return this.model.getCurrentPlayer()
    }

    getChancesOfWinning() {
        let playerValue = this.model.pieces.filter(piece=>piece.colour === this.model.getCurrentPlayer()).
            filter(piece=>!piece.isCaptured()).
            reduce((acc, piece)=>acc+piece.value,0)
        let enemyValue = this.model.pieces.filter(piece=>piece.colour !== this.model.getCurrentPlayer()).
            filter(piece=>!piece.isCaptured()).
            reduce((acc, piece)=>acc+piece.value,0)
        let result = (playerValue*100)/(playerValue+enemyValue)
        return Math.round(result)
    }

    init() {
        return this.model.init().map(piece =>  { return {x:7-piece.x, y:piece.y, src:piece.image} })
    }
    
    isMoveSafe(piece,x,y) {
        let moves = piece.getAvailableMoves(this.model.pieces).map(move=>{return {x:7-move.X, y:move.Y}})
        let backup = new Model()
        backup.currentPlayer = this.model.currentPlayer
        backup.pieces = this.model.pieces.map(piece=>piece)
        let drawCountBackup = this.drawCount

        this.move(7-piece.x, piece.y, x, y)
        let king = this.model.pieces.find(p=>p.type() === "King" && p.colour === piece.colour) 
        let check = king.isInDanger(this.model.pieces, king.x, king.y)
        this.model.currentPlayer = backup.currentPlayer
        this.model.pieces = backup.pieces.map(piece=>piece)
        this.drawCount = drawCountBackup
        return !check
    }

    getAvailableMoves(x,y) 
    {
         let piece = this.model.pieces.find(piece=>this.model.getCurrentPlayer() == "WHITE" && piece.x===7-x&&piece.y===y&&piece.colour === this.model.getCurrentPlayer())
         if(piece === undefined )
         {
             return []
         }
        else
        {
            let moves = piece.getAvailableMoves(this.model.pieces).map(move=>{return {x:7-move.X, y:move.Y}})
            let result = moves.filter(pieceMove => this.isMoveSafe(piece, pieceMove.x, pieceMove.y))
            return result
        }
    }

    move(x1, y1, x2, y2) {
        this.model.pieces = this.model.pieces.map(piece=>piece.move(piece.x, piece.y))
        let currentPiece = this.model.pieces.find(piece=>piece.x == 7-x1 && piece.y == y1)  // Locate the piece
        let destPiece = this.model.pieces.find(piece=>piece.x == 7-x2 && piece.y == y2)     // Check if the destination is occupied
                                                                                            // Input validated in view
        let enpPiece = this.model.pieces.find(piece=>piece.isAt(7-x1, y2))
        this.drawCount = (destPiece !== undefined || currentPiece.type() === "Pawn") ? 0 : this.drawCount+1
        let movedPiece = currentPiece.move(7-x2, y2)    
        let enPassantRes = (currentPiece.type() === "Pawn" && destPiece === undefined && y1 !== y2 && enpPiece !== undefined)?       // Normal movement is straight, therefore y1 === y2
            this.model.pieces.filter(piece=>piece!==currentPiece && !piece.isAt(7-x1,y2)).                  // If we're moving a pawn to an empty diagonal cell
                concat([movedPiece, this.model.pieces.find(piece=>piece.isAt(7-x1, y2)).move(-1,-1)])       // We must check for en-passant capture
            :
            this.model.pieces.filter(piece=>currentPiece!==piece && piece!=destPiece).
                concat([movedPiece])
        let rookY = y2==2? 0 : 7                                          // The y of the castling rook (if castling is a thing this move)
        let res = (currentPiece.type() == "King" && Math.abs(y1-y2)>1) ?  // If we're moving the king more than 1 square sideways it's castling
            enPassantRes.map(piece => {
                if(piece.isAt(currentPiece.x, rookY)) {
                    return piece.move(piece.x, rookY===7?5:3)
                } else
                    return piece
            }) 
            :
            enPassantRes
        var result = res.map(piece=>
            {
                if(!piece.isAt(movedPiece.x, movedPiece.y)) 
                {
                    //piece.enPassant = false
                }
                return piece
            }
        )
        if(destPiece === undefined) 
        {
            this.model.pieces = result
            if(!this.checkTransform())
                this.model.switchCurrentPlayer()
            return this.model.pieces.map(piece => {return {x:7-piece.x, y:piece.y, isCaptured:piece.isCaptured(), src:piece.image}})
        }
        else    
        {
            this.model.pieces = result.concat([destPiece.move(-1,-1)])
            if(!this.checkTransform())
                this.model.switchCurrentPlayer()
            return this.model.pieces.map(piece => {return {x:piece.x===-1?-1:7-piece.x, y:piece.y, isCaptured:piece.isCaptured(), src:piece.image}})
        }
    }
}

module.exports = controller;