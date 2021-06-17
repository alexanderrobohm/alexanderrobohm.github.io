boardWidth = 8
boardHeight = 16

playerToMove = 0

whiteBase = 36
blackBase = 64

// Notation: 
// Uppercase = White, Lowercase = black
// m = multiplex. t = superparticularis (triangle), s = superpartiens, p = pyramid
// /n = n empty squares
// left to, right, top to bottom (like FEN)
// Then, seperated by spaces: white base, black base, player to move
startingPosition = "S289S169/4S81S25S153P91T49T42T20T25S45S15T81T72M64M36M16M4T6T9/2M8M6M4M2/68m9m7m5m3/2t100t90m81m49m25m9t12t16p190s120t64t56t30t36s66s28s361s225/4s121s49 36 64 w"

positionColors = new Array(boardWidth * boardHeight)
positionTypes = new Array(boardWidth * boardHeight)
positionNumbers = new Array(boardWidth * boardHeight)

function executeMove(fromTile, toTile) {
	// Check for Capture
	if (positionNumbers[toTile] != 0) {
		capturedPiece = getPieceAtPosition(toTile)
		capturedPiece.parentNode.removeChild(capturedPiece)
	}
	
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
	playerToMove = s.split(" ")[3] === "w" ? 0 : 1
	whiteBase = parseInt(s.split(" ")[1])
	blackBase = parseInt(s.split(" ")[2])
	
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
	
	retval = retval + " " + whiteBase + " " + blackBase + (playerToMove == 0 ? " w" : " b")
	return retval;
}

function getLegalMoves(fromTile) {
	legalMoves = new Array()
	switch (positionTypes[fromTile]) {
		case "multiplex":
			legalMoves = getLegalMovesOfDistance(fromTile, 1)
			break;
		case "superparticularis":
			legalMoves = getLegalMovesOfDistance(fromTile, 2)
			break;
		case "superpartiens":
			legalMoves = getLegalMovesOfDistance(fromTile, 3)
			break;
		case "pyramid":
			getLegalMovesOfDistance(fromTile, 1).forEach(p => { if (!legalMoves.includes(p)) { legalMoves.push(p) } })
			getLegalMovesOfDistance(fromTile, 2).forEach(p => { if (!legalMoves.includes(p)) { legalMoves.push(p) } })
			getLegalMovesOfDistance(fromTile, 3).forEach(p => { if (!legalMoves.includes(p)) { legalMoves.push(p) } })
			break;
	}
	return legalMoves
}

function getLegalMovesOfDistance(fromTile, distance) {
	previousTiles = new Array()
	currentTiles = new Array()
	nextTiles = new Array()
	
	currentTiles.push(fromTile)
	
	for (i = distance-1; i >= 0; i--) {
		// Get next tiles
		currentTiles.forEach(ct => {
			// Only new, unvisited tiles
			getAdjacentTiles(ct).filter(at => { return !currentTiles.includes(at) && !previousTiles.includes(at) }).forEach(at => {
				// Filter out occupied tiles unless it is the last iteration
				if ((positionNumbers[at] == 0) || (i == 0)) {
					nextTiles.push(at)
				}
			})
		})
		// Add current tiles onto previous tiles
		currentTiles.forEach(ct => { if (!previousTiles.includes(ct)) { previousTiles.push(ct) } })
		// Move next tiles to current tiles
		currentTiles = new Array()
		nextTiles.forEach(nt => { if (!currentTiles.includes(nt)) { currentTiles.push(nt) } })
		nextTiles = new Array()
	}
	
	// Only allow capture of piece of different color and same value
	return currentTiles.filter(p => {
			isCapture = (positionNumbers[p] != 0)
			isSelfCapture = (positionColors[p] === ((playerToMove == 0) ? "white" : "black"))
			isEqualValue = (positionNumbers[p] == positionNumbers[fromTile])
			if (positionTypes[p] === "pyramid") {
				// Capture the base of the pyramid
				isEqualValue = isEqualValue || (positionNumbers[fromTile] == ((positionColors[p] === "white") ? whiteBase : blackBase))
			}
			
			return !isCapture || (isEqualValue && !isSelfCapture)
	})
}

function getAdjacentTiles(fromTile) {
	retval = new Array()
	
	x = fromTile % 8
	y = Math.floor(fromTile / 8)
	if (y > 0) {retval.push(fromTile - boardWidth) } // Up
	if (y < boardHeight-1) {retval.push(fromTile + boardWidth) } // Down
	if (x > 0) {retval.push(fromTile - 1)} // Left
	if (x < boardWidth-1) {retval.push(fromTile + 1)} // Right
	
	return retval;
}