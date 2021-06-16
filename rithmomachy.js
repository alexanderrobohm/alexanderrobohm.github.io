boardWidth = 8
boardHeight = 16

playerToMove = 0

// Notation: 
// Uppercase = White, Lowercase = black
// m = multiplex. t = superparticularis (triangle), s = superpartiens, p = pyramid
// /n = n empty squares
// left to, right, top to bottom (like FEN)
startingPosition = "S289S169/4S81S25S153P91T49T42T20T25S45S15T81T72M64M36M16M4T6T9/2M8M6M4M2/68m9m7m5m3/2t100t90m81m49m25m9t12t16p190s120t64t56t30t36s66s28s361s225/4s121s49 w"

positionColors = new Array(boardWidth * boardHeight)
positionTypes = new Array(boardWidth * boardHeight)
positionNumbers = new Array(boardWidth * boardHeight)

function moveIsLegal(fromTile, toTile) {
	return getPieceAtPosition(toTile) == null;
}

function executeMove(fromTile, toTile) {
	movedPiece = getPieceAtPosition(fromTile)
	movedPiece.setAttribute("position", toTile)
	resizePiece(movedPiece)
	
	positionColors[toTile] = positionColors[fromTile]
	positionTypes[toTile] = positionTypes[fromTile]
	positionNumbers[toTile] = positionNumbers[fromTile]
	
	positionColors[fromTile] = ""
	positionTypes[fromTile] = ""
	positionNumbers[fromTile] = 0
	
	playerToMove = 1-playerToMove
}

function setupPieces(positionString) {
	clearBoard()
	
	getPositionFromString(positionString)
	
	for (i = 0; i < boardWidth * boardHeight; i++) {
		if (positionNumbers[i] != 0) { placePiece(i, positionColors[i], positionTypes[i], positionNumbers[i]) }
	}
}

function getPositionFromString(s) {
	playerToMove = s.split(" ")[1] === "w" ? 0 : 1
	
	types = s.split(" ")[0].split(/([a-zA-Z\/])\d+/).filter(Boolean)
	numbers = s.split(" ")[0].split(/[a-zA-Z\/](\d+)/).filter(Boolean)
	if (types.length != numbers.length) { return false; }
	
	tokenCounter = 0
	skipCounter = 0
	for (y = boardHeight - 1; y >= 0; y--) {
		for (x = 0; x < boardWidth; x++) {
			i = boardWidth * y + x
			if (skipCounter > 0) {
				positionColors[i] = ""
				positionTypes[i] = ""
				positionNumbers[i] = 0
				skipCounter--;
				continue;
			}
			if (tokenCounter < types.length) {
				switch (types[tokenCounter].toLowerCase()) {
					case "m":
						positionTypes[i] = "multiplex"
						break;
					case "t":
						positionTypes[i] = "superparticularis"
						break;
					case "s":
						positionTypes[i] = "superpartiens"
						break;
					case "p":
						positionTypes[i] = "pyramid"
						break;
					case "/":
						positionColors[i] = ""
						positionTypes[i] = ""
						positionNumbers[i] = 0
						skipCounter = numbers[tokenCounter] - 1
						break;
				}
				if (types[tokenCounter] !== "/") {
					positionNumbers[i] = parseInt(numbers[tokenCounter])
					positionColors[i] = types[tokenCounter] === types[tokenCounter].toLowerCase() ? "black" : "white"
				}
				tokenCounter++
			} else {
				positionColors[i] = ""
				positionTypes[i] = ""
				positionNumbers[i] = 0
			}
		}
	}
}

function getStringFromPosition() {
	retval = ""
	type = ""
	emptyCounter = 0
	
	for (y = boardHeight - 1; y >= 0; y--) {
		for (x = 0; x < boardWidth; x++) {
			i = boardWidth * y + x
			
			if (positionNumbers[i] == 0) {
				emptyCounter++
				continue;
			}
			
			if (emptyCounter > 0) {
				retval = retval + "/" + emptyCounter
				emptyCounter = 0
			}
			
			switch (positionTypes[i]) {
				case "multiplex":
					type = "m"
					break;
				case "superparticularis":
					type = "t"
					break;
				case "superpartiens":
					type = "s"
					break;
				case "pyramid":
					type = "p"
					break;
				
			}
			if (positionColors[i] === "white") { type = type.toUpperCase() }
			retval = retval + type + positionNumbers[i]
		}
	}
	
	retval = retval + (playerToMove == 0 ? " w" : " b")
	return retval;
}

function getLegalMoves(fromTile) {
	retval = new Array()
	retval.push(4)
	retval.push(12)
	retval.push(20)
	retval.push(28)
	retval.push(36)
	retval.push(44)
	retval.push(52)
	
	return retval;
}