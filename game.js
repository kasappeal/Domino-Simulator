import { numberOfPieces } from './pieces.js'

const PIECES_TO_GRAB_PER_TURN = 2
const BOTH = 'both'
const LEFT = 'left'
const RIGHT = 'right'

export const dominoGame = {
    reservedPieces: [],
    piecesOnTable: [],
    playerPieces: [],

    flipPiece: function(piece) {
        return [piece[1], piece[0]]
    },

    loadPieces: function (pieces) {
        // esto da para explicar las arrow functions y programación funcional
        this.reservedPieces = pieces.map(p => p).sort(() => Math.random() - 0.5)
    },

    takePieceFromReservedPieces: function() {
        return this.reservedPieces.pop()
    },

    takePieces: function() {
        const piecesToTake = []
        for (let i = 0; i < PIECES_TO_GRAB_PER_TURN && this.reservedPieces.length > 0; i++) {
            // aquí podemos poner una cáscara de plátano para que pete cuando no hay más fichas que robar
            // aquí podemos usar control de excepciones cuando no queden más piezas que robar
            piecesToTake.push(this.takePieceFromReservedPieces())
        }
        return piecesToTake
    },

    generatePiecesString: function(pieces) {
        let tops = ''
        let piecesData = ''
        let bottoms = ''
        pieces.forEach(piece => {
            if (piece[0] == piece[1]) {
                tops += `|${piece[0]}|`
                piecesData += '|=|'
                bottoms += `|${piece[1]}|`
            } else {
                tops += '     '
                piecesData += `|${piece[0]}|${piece[1]}|`
                bottoms += '     '
            }
        })
        return `${tops}\n${piecesData}\n${bottoms}`
    },

    printGameStatus: function(piecesConnected) {
        // si pintamos el antes y el después de la mesa cuando se pone una ficha, queda mejor y nos obliga a "copiar los datos de la jugada anterior"
        console.log(`Number of pieces reserved: ${this.reservedPieces.length}`)
        console.log(`Tables\' pieces (${this.piecesOnTable.length}):`)
        console.log(this.generatePiecesString(this.piecesOnTable))
        console.log(`Player\' pieces (${this.playerPieces.length}):`)
        console.log(this.generatePiecesString(this.playerPieces))
        console.log('Pieces connected on this turn:')
        console.log(this.generatePiecesString(piecesConnected.map(p => p.piece)))
        console.log('==========================================')
    },

    getPlayerPiecesToConnect: function() {
        const possiblePiecesToConnect = []
        for (const piece of this.playerPieces) {
            const place = this.whereThePieceCanBePlacedAndHow(piece)
            if (place !== null) {
                // Cojonudo para usar objetos literales: qué pieza, dónde y cómo
                possiblePiecesToConnect.push({ piece, ...place })
            }
        }
        return possiblePiecesToConnect
    },

    playerCanPutPiecesOnTable: function(piece) {
        for (const piece of this.playerPieces) {
            if (this.whereThePieceCanBePlacedAndHow(piece) !== null) {
                return true
            }
        }
        return false 
    },

    whereThePieceCanBePlacedAndHow: function(piece) {
        const firstNumber = this.piecesOnTable[0][0]
        const canInLeft = firstNumber == piece[0] || firstNumber == piece[1]
        if (canInLeft) {
            // Cojonudo para usar objetos literales: donde y cómo se puede poner la pieza?
            return { side: LEFT, needsToBeFlipped: firstNumber == piece[0] }
        }
        
        const lastNumber = this.piecesOnTable[this.piecesOnTable.length - 1][1]
        const canInRight = lastNumber == piece[0] || lastNumber == piece[1]
        if (canInRight) {
            // Cojonudo para usar objetos literales: donde y cómo se puede poner la pieza?
            return { side: RIGHT, needsToBeFlipped: lastNumber == piece[1] }
        }

        return null
    },

    putPieceOnTable: function(pieceAndSide) { 
        this.playerPieces = this.playerPieces.filter(p => p != pieceAndSide.piece)
        if (pieceAndSide.needsToBeFlipped) {
            pieceAndSide.piece = this.flipPiece(pieceAndSide.piece)
        }
        if (pieceAndSide.side == RIGHT) {
            this.piecesOnTable.push(pieceAndSide.piece)
        }
        if (pieceAndSide.side == LEFT) {
            this.piecesOnTable.unshift(pieceAndSide.piece)
        }
    },

    gameIsFinished: function() {
        return this.reservedPieces.length == 0 
        && (
            !this.playerCanPutPiecesOnTable() 
            || (this.playerPieces.length == 0 && this.piecesOnTable.length == numberOfPieces)
        )
    },

    play: function() {
        if (this.reservedPieces.length == 0) {
            console.error('No pieces in reservedPieces')
            return false
        }

        // first piece on table
        this.piecesOnTable = [this.takePieceFromReservedPieces()]

        // coger dos piezas

        do {
            const piecesToConnect = this.getPlayerPiecesToConnect()
            for (const pieceAndPlace of piecesToConnect) {
                // este bucle sería mejorable, porque no es muy intuitivo, este if
                if (this.playerCanPutPiecesOnTable()) {
                    this.putPieceOnTable(pieceAndPlace)
                }
            }
            // robar
            if (piecesToConnect.length == 0) {
                const pieces = this.takePieces()
                this.playerPieces.push(...pieces)
            }
            this.printGameStatus(piecesToConnect)
        } while (!this.gameIsFinished())
    }
}
