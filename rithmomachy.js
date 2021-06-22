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
// Then, seperated by spaces: white base, black base, move number, player to move
startingPosition = "S289S169/4S81S25S153P91T49T42T20T25S45S15T81T72M64M36M16M4T6T9/2M8M6M4M2/68m9m7m5m3/2t100t90m81m49m25m9t12t16p190s120t64t56t30t36s66s28s361s225/4s121s49 36 64 1 w"
captureTestPosition = "/10m14/8m4/5M5S2/2m15/4M7/7p190m2m5/5M32m7M3/6M2/86 36 64 1 w"

positionColors = new Array(boardWidth * boardHeight)
positionTypes = new Array(boardWidth * boardHeight)
positionNumbers = new Array(boardWidth * boardHeight)

lastLegalMoves = new Array
lastLegalMovesTile = -1

gameString = ""
moveNumber = 1


function executeMove(fromTile, toTile) {
	if (!getLegalMoves(fromTile).includes(toTile)) { return }

	// Update game String (PGN-like)
	gameString = gameString + (playerToMove == 0 ? ((gameString === "" ? "" : " ") + moveNumber + ". ") : " ")
	gameString = gameString + getCoordsForPosition(fromTile) + "-" + getCoordsForPosition(toTile)

	// Check for Capture
	if (positionNumbers[toTile] != 0) {
		let capturedPiece = getPieceAtPosition(toTile)
		capturedPiece.parentNode.removeChild(capturedPiece)
	}

	let movedPiece = getPieceAtPosition(fromTile)
	movedPiece.setAttribute("position", toTile)
	resizePiece(movedPiece)

	positionColors[toTile] = positionColors[fromTile]
	positionTypes[toTile] = positionTypes[fromTile]
	positionNumbers[toTile] = positionNumbers[fromTile]

	positionColors[fromTile] = ""
	positionTypes[fromTile] = ""
	positionNumbers[fromTile] = 0

	let captures = getPossibleCaptures(fromTile, toTile)
	if (captures.length > 0) {
		// Alway deselect before calling executeMove
		getPieceAtPosition(toTile).classList.add("capturing")
		captures.push(toTile)
		placeMoveDestSquares(captures)
	} else {
		endTurn()
	}
}

function endTurn() {
	// Look for winning combinations for white and black
	victoryCombinations = [new Array(), new Array()]
	
	let whiteVictoryCombinations = findWinningCombinations(0)
	let blackVictoryCombinations = findWinningCombinations(1)
	
	if (whiteVictoryCombinations.length > 0 || blackVictoryCombinations.length > 0) {
		let victorySquarePositions = new Array()
		whiteVictoryCombinations.forEach(c => {
			if (!victorySquarePositions.includes(c[4])) { victorySquarePositions.push(c[4]) }
			if (!victorySquarePositions.includes(c[5])) { victorySquarePositions.push(c[5]) }
			if (!victorySquarePositions.includes(c[6])) { victorySquarePositions.push(c[6]) }
		})
		blackVictoryCombinations.forEach(c => {
			if (!victorySquarePositions.includes(c[4])) { victorySquarePositions.push(c[4]) }
			if (!victorySquarePositions.includes(c[5])) { victorySquarePositions.push(c[5]) }
			if (!victorySquarePositions.includes(c[6])) { victorySquarePositions.push(c[6]) }
		})
		victorySquarePositions.forEach(p => { placeVictorySquare(p) })
		
		// Game is over
		if (blackVictoryCombinations.length == 0) {
			gameString += " 1-0"
			console.log("White wins!")
		} else if (whiteVictoryCombinations.length == 0) {
			gameString += " 0-1"
			console.log("Black wins!")
		} else {
			gameString += " 1/2-1/2"
			console.log("Draw!")
		}
		
		if (whiteVictoryCombinations.length > 0) {
			console.log("\nWhite:")
			whiteVictoryCombinations.forEach(e => {
				console.log(e[0] + "-" + e[1] + "-" + e[2] + " (" + e[3] + ")")
			})
		}
		if (blackVictoryCombinations.length > 0) {
		console.log("\nBlack:")
			blackVictoryCombinations.forEach(e => {
				console.log(e[0] + "-" + e[1] + "-" + e[2] + " (" + e[3] + ")")
			})
		}
	} else {	
		lastLegalMovesTile = -1
		playerToMove = 1-playerToMove
		if (playerToMove == 0) { moveNumber++ }
	}
}

function findWinningCombinations(forPlayer) {
	// Find all pieces on opponent*s side of the board
	// TODO: optimise, terrible method
	let combinations = new Array()
	
	let piecePositions = new Array()
	
	let startPos = (forPlayer == 0) ? 0 : (boardHeight * boardWidth/2)
	let endPos = (forPlayer == 0) ? (boardHeight * boardWidth/2 - 1) : (boardHeight * boardWidth - 1)
	
	for (let pos = startPos; pos <= endPos; pos++) {
		if (positionNumbers[pos]) { piecePositions.push(pos) }
	}
	
	// Check if it is the center of 3 equally spaced pieces on that side of the board
	piecePositions.forEach(pos => {
		let upDistance = Math.floor((pos - startPos) / boardWidth)
		let downDistance = Math.floor((endPos - pos) / boardWidth)
		let leftDistance = pos % boardWidth
		let rightDistance = boardWidth - 1 - leftDistance
		
		for (let x = 1; x <= Math.min(upDistance, downDistance); x++) {
			let upPos = pos - x*boardWidth
			let downPos = pos + x*boardWidth
			if ((positionNumbers[upPos]) || (positionNumbers[downPos])) {
				let cs = checkCombination(upPos, pos, downPos, forPlayer)
				cs.forEach(c => { combinations.push(c) })
				break
			}
		}
		for (let x = 1; x <= Math.min(leftDistance, leftDistance); x++) {
			let leftPos = pos - x
			let rightPos = pos + x
			if ((positionNumbers[leftPos]) || (positionNumbers[rightPos])) {
				let cs = checkCombination(leftPos, pos, rightPos, forPlayer)
				cs.forEach(c => { combinations.push(c) })
				break
			}
		}
	})
	
	return combinations
}

function checkCombination(pos1, pos2, pos3, forPlayer) {
	let retval = new Array()
	let color = (forPlayer == 0) ? "white" : "black"
	
	if (positionNumbers[pos1] && positionNumbers[pos2] && positionNumbers[pos3]
			&& ((positionColors[pos1] === color) || (positionColors[pos2] === color) || (positionColors[pos3] === color))) {
		let values = [positionNumbers[pos1], positionNumbers[pos2], positionNumbers[pos3]].sort((a, b) => {return a-b})
		let arithmetic = ((values[1] - values[0] == values[2] - values[1]))
		let geometric = ((values[1] / values[0] == values[2] / values[1]))
		let harmonic = ((values[2] - values[1]) / (values[1] - values[0]) == values[2] / values[0])
		if (arithmetic || geometric || harmonic) {
			if (arithmetic) { retval.push([values[0], values[1], values[2], "arithmetic", pos1, pos2, pos3]) }
			if (geometric) { retval.push([values[0], values[1], values[2], "geometric", pos1, pos2, pos3]) }
			if (harmonic) { retval.push([values[0], values[1], values[2], "harmonic", pos1, pos2, pos3]) }
		}
	}
	return retval
}

function getCoordsForPosition(position) {
	let x = position % boardWidth
	let y = Math.floor(position / boardWidth)
	return String.fromCharCode(x + 97) + (boardHeight - y)
}

function getPossibleCaptures(pFrom, pTo) {
	let possibleCaptures = new Array()
	// Seek to nearest piece in a straight line and attempt capture
	// Up
	for (i = pTo - boardWidth; i > 0; i -= boardWidth) {
		if (positionNumbers[i] != 0) {
			if (canCapture(pTo, i, 1)) { possibleCaptures.push(i) }
			break
		}
	}
	// Down
	for (i = pTo + boardWidth; i < boardWidth * boardHeight; i += boardWidth) {
		if (positionNumbers[i] != 0) {
			if (canCapture(pTo, i, 0)) { possibleCaptures.push(i) }
			break
		}
	}
	// Left
	if (pTo % boardWidth > 0) {
		for (i = pTo - 1; i > 0; i -= 1) {
			if (positionNumbers[i] != 0) {
				if (canCapture(pTo, i, 3)) { possibleCaptures.push(i) }
				break
			}
			if (i % boardWidth == 0) { break }
		}
	}
	// Right
	if (pTo % boardWidth < boardWidth - 1) {
		for (i = pTo + 1; i < boardWidth * boardHeight; i += 1) {
			if (positionNumbers[i] != 0) {
				if (canCapture(pTo, i, 2)) { possibleCaptures.push(i) }
				break
			}
			if (i % boardWidth == boardWidth - 1) { break }
		}
	}

	let upPieceDiscovered = -1
	let downPieceDiscovered = -1
	let leftPieceDiscovered = -1
	let rightPieceDiscovered = -1

	let movedHorizontally = (pFrom % boardWidth) != (pTo % boardWidth)
	let movedVertically = (Math.floor(pFrom / boardWidth)) != (Math.floor(pTo / boardWidth))

	let colorToMove = (playerToMove == 0) ? "white" : "black"

	// Discovered captures
	if (movedHorizontally) {
		// Up
		for (i = pFrom - boardWidth; i > 0; i -= boardWidth) {
			if (positionNumbers[i] != 0) {
				upPieceDiscovered = i
				break
			}
		}
		// Down
		for (i = pFrom + boardWidth; i < boardWidth * boardHeight; i += boardWidth) {
			if (positionNumbers[i] != 0) {
				downPieceDiscovered = i
				break
			}
		}
	}
	if (movedVertically) {
		// Left
		if (pTo % boardWidth > 0) {
			for (i = pFrom - 1; i > 0; i -= 1) {
				if (positionNumbers[i] != 0) {
					leftPieceDiscovered = i
					break
				}
				if (i % boardWidth == 0) { break }
			}
		}
		// Right
		if (pTo % boardWidth < boardWidth - 1) {
			for (i = pFrom + 1; i < boardWidth * boardHeight; i += 1) {
				if (positionNumbers[i] != 0) {
					rightPieceDiscovered = i
					break
				}
				if (i % boardWidth == boardWidth - 1) { break }
			}
		}
	}
	if ((upPieceDiscovered >= 0) && (downPieceDiscovered >= 0)
			&& (positionColors[upPieceDiscovered] === colorToMove)
			&& canCapture(upPieceDiscovered, downPieceDiscovered, 0)) {
		possibleCaptures.push(downPieceDiscovered)
	}
	if ((downPieceDiscovered >= 0) && (upPieceDiscovered >= 0)
			&& (positionColors[downPieceDiscovered] === colorToMove)
			&& canCapture(downPieceDiscovered, upPieceDiscovered, 1)) {
		possibleCaptures.push(upPieceDiscovered)
	}
	if ((leftPieceDiscovered >= 0) && (rightPieceDiscovered >= 0)
			&& (positionColors[leftPieceDiscovered] === colorToMove)
			&& canCapture(leftPieceDiscovered, rightPieceDiscovered, 2)) {
		possibleCaptures.push(rightPieceDiscovered)
	}
	if ((rightPieceDiscovered >= 0) && (leftPieceDiscovered >= 0)
			&& (positionColors[rightPieceDiscovered] === colorToMove)
			&& canCapture(rightPieceDiscovered, leftPieceDiscovered, 3)) {
		possibleCaptures.push(leftPieceDiscovered)
	}

	return possibleCaptures
}

function canCapture(capturingTile, capturedTile, capturingTileDirection) {
	if (positionColors[capturedTile] === positionColors[capturingTile]) { return false }

	// Primes are captured when entirely surrounded
	if (isPrime(positionNumbers[capturedTile])) {
		let isSurrounded = true
		getAdjacentTiles(capturedTile, -1).forEach(at => { isSurrounded &&= (positionNumbers[at] != 0) })
		if (isSurrounded) { return true }
	}

	let captureDistance = Math.abs(capturedTile - capturingTile)
	if (captureDistance % boardWidth > 0) {
		captureDistance = captureDistance % boardWidth
	} else {
		captureDistance = Math.floor(captureDistance / boardWidth)
	}

	// a captures a*b over b empty squares
	if (captureDistance >= 2) {
		let isEqualValue = positionNumbers[capturingTile] * (captureDistance-1) == positionNumbers[capturedTile]
		if (positionTypes[capturedTile] === "pyramid") {
			// Capture the base of the pyramid
			isEqualValue ||= (positionNumbers[capturingTile] * (captureDistance-1) == ((positionColors[capturedTile] === "white") ? whiteBase : blackBase))
		}
		if (isEqualValue) { return true }
	}

	// a and b capture a+b or a*b when touching
	if (captureDistance == 1) {
		let isEqualValue = false
		getAdjacentTiles(capturedTile, capturingTileDirection).forEach(at => {
			if (positionColors[at] === ((positionColors[capturedTile] === "white") ? "black" : "white")) {
				isEqualValue = isEqualValue
						|| (positionNumbers[at] + positionNumbers[capturingTile] == positionNumbers[capturedTile])
						|| (positionNumbers[at] * positionNumbers[capturingTile] == positionNumbers[capturedTile])
			}
			if (positionTypes[capturedTile] === "pyramid") {
				// Capture the base of the pyramid
				isEqualValue = isEqualValue
						|| (positionNumbers[at] + positionNumbers[capturingTile] == ((positionColors[capturedTile] === "white") ? whiteBase : blackBase))
						|| (positionNumbers[at] * positionNumbers[capturingTile] == ((positionColors[capturedTile] === "white") ? whiteBase : blackBase))
			}
		})
		if (isEqualValue) { return true }
	}
}

function capturePieceAt(position) {
	let capturedPiece = getPieceAtPosition(position)
	capturedPiece.parentNode.removeChild(capturedPiece)
	positionColors[position] = ""
	positionTypes[position] = ""
	positionNumbers[position] = 0

	gameString = gameString + "x" + getCoordsForPosition(position)
}

function isPrime(n) {
	for (divisor = 2; divisor < n; divisor++) {
		if (n % divisor == 0) {
			return false
		}
	}
	return true
}

function setupPieces(positionString) {
	clearBoard()

	lastLegalMovesTile = -1
	
	victoryCombinations = [new Array(), new Array()]

	getPositionFromString(positionString)

	gameString = (playerToMove == 0) ? "" : (moveNumber + "...")

	for (i = 0; i < boardWidth * boardHeight; i++) {
		if (positionNumbers[i] != 0) { placePiece(i, positionColors[i], positionTypes[i], positionNumbers[i]) }
	}
}

function getPositionFromString(s) {
	if (!/^([mMtTsSpP/]\d+)+ \d+ \d+ \d+ [wb]$/.test(s)) {
		console.log("Invalid position String!")
		return
	}

	playerToMove = s.split(" ")[4] === "w" ? 0 : 1
	whiteBase = parseInt(s.split(" ")[1])
	blackBase = parseInt(s.split(" ")[2])
	moveNumber = parseInt(s.split(" ")[3])

	let types = s.split(" ")[0].split(/([a-zA-Z\/])\d+/).filter(Boolean)
	let numbers = s.split(" ")[0].split(/[a-zA-Z\/](\d+)/).filter(Boolean)
	if (types.length != numbers.length) { return false; }

	let tokenCounter = 0
	let skipCounter = 0
	for (let y = boardHeight - 1; y >= 0; y--) {
		for (let x = 0; x < boardWidth; x++) {
			let i = boardWidth * y + x
			if (skipCounter > 0) {
				positionColors[i] = ""
				positionTypes[i] = ""
				positionNumbers[i] = 0
				skipCounter--
				continue
			}
			if (tokenCounter < types.length) {
				switch (types[tokenCounter].toLowerCase()) {
					case "m":
						positionTypes[i] = "multiplex"
						break
					case "t":
						positionTypes[i] = "superparticularis"
						break
					case "s":
						positionTypes[i] = "superpartiens"
						break
					case "p":
						positionTypes[i] = "pyramid"
						break
					case "/":
						positionColors[i] = ""
						positionTypes[i] = ""
						positionNumbers[i] = 0
						skipCounter = numbers[tokenCounter] - 1
						break
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
	let retval = ""
	let type = ""
	let emptyCounter = 0

	for (let y = boardHeight - 1; y >= 0; y--) {
		for (let x = 0; x < boardWidth; x++) {
			let i = boardWidth * y + x

			if (positionNumbers[i] == 0) {
				emptyCounter++
				continue
			}

			if (emptyCounter > 0) {
				retval = retval + "/" + emptyCounter
				emptyCounter = 0
			}

			switch (positionTypes[i]) {
				case "multiplex":
					type = "m"
					break
				case "superparticularis":
					type = "t"
					break
				case "superpartiens":
					type = "s"
					break
				case "pyramid":
					type = "p"
					break

			}
			if (positionColors[i] === "white") { type = type.toUpperCase() }
			retval = retval + type + positionNumbers[i]
		}
	}

	retval = retval + " " + whiteBase + " " + blackBase + " " + moveNumber + (playerToMove == 0 ? " w" : " b")
	return retval
}

function getLegalMoves(fromTile) {
	if (fromTile == lastLegalMovesTile) {
		return lastLegalMoves
	} else {
		let legalMoves = null
		switch (positionTypes[fromTile]) {
			case "multiplex":
				legalMoves = getLegalMovesOfDistance(fromTile, 1, false)
				break
			case "superparticularis":
				legalMoves = getLegalMovesOfDistance(fromTile, 2, false)
				break
			case "superpartiens":
				legalMoves = getLegalMovesOfDistance(fromTile, 3, false)
				break
			case "pyramid":
				legalMoves = getLegalMovesOfDistance(fromTile, 3, true)
				break
			default:
				legalMoves = new Array()
		}
		lastLegalMoves = legalMoves
		lastLegalMovesTile = fromTile
		return legalMoves
	}
}

function getLegalMovesOfDistance(fromTile, distance, includeLowerDistances) {
	let previousTiles = new Array()
	let currentTiles = new Array()
	let nextTiles = new Array()

	currentTiles.push(fromTile)

	for (let i = distance-1; i >= 0 && currentTiles.length > 0; i--) {
		// Get next tiles
		currentTiles.forEach(ct => {
			// Only new, unvisited tiles
			getAdjacentTiles(ct, -1).filter(at => { return !currentTiles.includes(at) && !previousTiles.includes(at) }).forEach(at => {
				// Filter out occupied tiles unless it is the last iteration
				if ((positionNumbers[at] == 0) || (i == 0)) {
					nextTiles.push(at)
				}
			})
		})
		// Add current tiles onto previous tiles
		currentTiles.forEach(ct => { if (!previousTiles.includes(ct)) { previousTiles.push(ct) } })
		// Move next tiles to current tiles
		if (!includeLowerDistances || i == distance-1) {
			currentTiles = new Array()
		}
		nextTiles.forEach(nt => { if (!currentTiles.includes(nt)) { currentTiles.push(nt) } })
		nextTiles = new Array()
	}

	// Only allow capture of piece of different color and same value
	return currentTiles.filter(p => {
			let isCapture = (positionNumbers[p] != 0)
			let isSelfCapture = (positionColors[p] === ((playerToMove == 0) ? "white" : "black"))
			let isEqualValue = (positionNumbers[p] == positionNumbers[fromTile])
			if (positionTypes[p] === "pyramid") {
				// Capture the base of the pyramid
				isEqualValue ||= (positionNumbers[fromTile] == ((positionColors[p] === "white") ? whiteBase : blackBase))
			}

			return !isCapture || (isEqualValue && !isSelfCapture)
	})
}

function getAdjacentTiles(fromTile, excludeDirection) {
	let retval = new Array()

	let x = fromTile % 8
	let y = Math.floor(fromTile / 8)
	if ((excludeDirection != 0) && (y > 0)) {retval.push(fromTile - boardWidth) } // Up = 0
	if ((excludeDirection != 1) && (y < boardHeight-1)) {retval.push(fromTile + boardWidth) } // Down = 1
	if ((excludeDirection != 2) && (x > 0)) {retval.push(fromTile - 1)} // Left = 2
	if ((excludeDirection != 3) && (x < boardWidth-1)) {retval.push(fromTile + 1)} // Right = 3

	return retval
}
