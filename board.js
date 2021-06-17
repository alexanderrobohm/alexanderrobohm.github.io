function init() {
	b = document.getElementById("board")
	
	b.addEventListener("mousedown", mouseDown)
	document.addEventListener("mousemove", mouseMove)
	document.addEventListener("mouseup", mouseUp)
	b.addEventListener("contextmenu", (e) => { e.preventDefault() })
	b.setAttribute("ondragstart", "return false;")
	document.body.setAttribute("onresize", "resizeBoard()")
	
	b.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
	
	b.style.display = "grid"
	b.style.gridTemplateColumns = "repeat(" + boardWidth + ", " + boardWidth + "fr)"
	
	// Create Tiles
	for (j = boardHeight - 1; j >= 0; j--){
		for (i = 0; i < boardWidth; i++) {
			tile = document.createElement("div")
			tile.classList.add("tile")
			tile.classList.add((i+j)%2 ? "light-tile" : "dark-tile")
			b.appendChild(tile)
		}
	}
	
	// Create coordinate labels
	// Files
	for (i = 0; i < boardWidth; i++){
		t = b.getElementsByClassName("tile")[boardWidth*(boardHeight-1) + i]
		t.classList.add("coord-tile")
		l = document.createElement("div")
		l.innerText = String.fromCharCode(97 + i)
		l.classList.add("coord")
		l.classList.add("coord-file")
		t.appendChild(l)
	}
	//Ranks
	for (i = 0; i < boardHeight; i++){
		t = b.getElementsByClassName("tile")[boardWidth*(boardHeight-i) - 1]
		t.classList.add("coord-tile")
		l = document.createElement("div")
		l.innerText = i + 1;
		l.classList.add("coord")
		l.classList.add("coord-rank")
		t.appendChild(l)
	}
	
	// Create selection and last move squares
	s = document.createElement("div")
	s.classList.add("square")
	s.classList.add("select")
	b.appendChild(s)
	placeSquare(s, -1)	
	
	s = document.createElement("div")
	s.classList.add("square")
	s.classList.add("last-move")
	b.appendChild(s)
	placeSquare(s, -1)	
	
	s = document.createElement("div")
	s.classList.add("square")
	s.classList.add("last-move")
	b.appendChild(s)
	placeSquare(s, -1)	
	
	setupPieces(startingPosition)
	
	resizeBoard()
}

function placePiece (position, color, type, number) {
	piece = document.createElement("div")
		
	piece.classList.add("piece")
	piece.setAttribute("pieceType", type)
	piece.setAttribute("position", position)
	piece.setAttribute("draggable", "false")
	
	
	switch (color) {
		case "ghost":
			piece.style.visibility = "hidden"
			piece.classList.add("ghost")
			break;
		case "white":
			piece.classList.add("white")
			break;
		case "black":
			piece.classList.add("black")
			break;
	}
	
	if (color !== "ghost") {
		piece.classList.add(type)
		piece.innerText = number
	}
	
	b.appendChild(piece)
	resizePiece(piece)
}

function clearBoard() {
	deselect()
	
	placeSquare(b.getElementsByClassName("last-move")[0], -1)
	placeSquare(b.getElementsByClassName("last-move")[1], -1)
	
	while (b.getElementsByClassName("piece").length > 0) {
		pieces = b.getElementsByClassName("piece")
		Array.prototype.forEach.call(pieces, p => {	p.parentNode.removeChild(p)	})
	}
	
	placePiece(-1, "ghost", null, 0)
}

function getPieceAtPosition(pos) {
	retval = null
	pieces = b.getElementsByClassName("piece")
	Array.prototype.forEach.call(pieces, (p) => {
		if ((parseInt(p.getAttribute("position")) === pos) && !p.classList.contains("ghost")) {
			retval = p
		}
	})
	return retval;
}

function placeSquare(square, position) {
	if (position >= 0) {
		t = b.getElementsByClassName("tile")[position]
		square.style.left = t.offsetLeft
		square.style.top = t.offsetTop
		square.style.width = t.offsetWidth
		square.style.height = t.offsetHeight
		square.style.visibility = "visible"
	} else {
		square.style.left = 0
		square.style.top = 0
		square.style.width = 0
		square.style.height = 0
		square.style.visibility = "hidden"
	}
	square.setAttribute("position", position)
}

function placeMoveDestSquares(positions) {
	destroyMoveDestSquares()
	positions.forEach(p => {
		piece = getPieceAtPosition(p)
		lastMoveSquare1 = b.getElementsByClassName("last-move")[0]
		lastMoveSquare1 = b.getElementsByClassName("last-move")[1]
		lastMoveSquare1Position = parseInt(lastMoveSquare1.getAttribute("position"))
		lastMoveSquare2Position = parseInt(lastMoveSquare1.getAttribute("position"))
		
		s = null
		if (p == lastMoveSquare1Position) {
			s = lastMoveSquare1
		} else if (p == lastMoveSquare2Position) {
			s = lastMoveSquare2
		} else {
			s = document.createElement("div")
			s.classList.add("square")
			b.appendChild(s)
		}
		
		s.classList.add(!piece ? "move-dest" : "move-dest-c")
		placeSquare(s, p)
	})
}

function destroyMoveDestSquares() {
	while (b.getElementsByClassName("move-dest").length > 0) {
		moveDestSquares = b.getElementsByClassName("move-dest")
		Array.prototype.forEach.call(moveDestSquares, p => {
			if (p.classList.contains("last-move")) {
				p.classList.remove("move-dest")
			} else { 
				p.parentNode.removeChild(p)
			}
		})
	}
	while (b.getElementsByClassName("move-dest-c").length > 0) {
		moveDestSquares = b.getElementsByClassName("move-dest-c")
		Array.prototype.forEach.call(moveDestSquares, p => {
			if (p.classList.contains("last-move")) {
				p.classList.remove("move-dest-c")
			} else { 
				p.parentNode.removeChild(p)
			}
		})
	}
}

function deselect() {
	selectionSquare = b.getElementsByClassName("select")[0]
	placeSquare(selectionSquare, -1)
	selectionSquare.classList.remove("selected")
	destroyMoveDestSquares()
}

// From https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
function touchHandler(event)
{
	var touches = event.changedTouches,
	first = touches[0],
	type = "";
	switch(event.type) {
		case "touchstart": type = "mousedown"; break;
		case "touchmove":  type = "mousemove"; break;        
		case "touchend":   type = "mouseup";   break;
		default:           return;
	}

	// initMouseEvent(type, canBubble, cancelable, view, clickCount, 
	//                screenX, screenY, clientX, clientY, ctrlKey, 
	//                altKey, shiftKey, metaKey, button, relatedTarget);

	var simulatedEvent = document.createEvent("MouseEvent");
	simulatedEvent.initMouseEvent(type, true, true, window, 1, 
	                              first.screenX, first.screenY, 
	                              first.clientX, first.clientY, false, 
	                              false, false, false, 0, null);

	first.target.dispatchEvent(simulatedEvent);
	event.preventDefault();
}

function mouseDown(event) {
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	dragging = ghostPiece.getAttribute("position") !== "-1"
	
	// Left click
	if (!dragging && (event.button == 0)) {
		// Drag a piece
		if (event.target.classList.contains("piece")
				&& (event.target.classList.contains(playerToMove == 0 ? "white" : "black"))) {
			draggedPiece = event.target
			draggedFrom = parseInt(draggedPiece.getAttribute("position"))
			
			ghostPiece.style.backgroundImage = getComputedStyle(draggedPiece).getPropertyValue("background-image")
			ghostPiece.style.fontSize = getComputedStyle(draggedPiece).getPropertyValue("font-size")
			ghostPiece.style.lineHeight = getComputedStyle(draggedPiece).getPropertyValue("line-height")
			ghostPiece.style.color = getComputedStyle(draggedPiece).getPropertyValue("color")
			ghostPiece.innerText = draggedPiece.innerText
			ghostPiece.setAttribute("position", draggedFrom)
			resizePiece(ghostPiece)
			
			draggedPiece.classList.add("dragged")
			
			selectionSquare = b.getElementsByClassName("select")[0]
			if (parseInt(selectionSquare.getAttribute("position")) != draggedFrom) {
				deselect()
			}
			placeSquare(selectionSquare, draggedFrom)
			placeMoveDestSquares(getLegalMoves(draggedFrom))
			
		} else {
			if (event.target.classList.contains("move-dest") || event.target.classList.contains("move-dest-c")) {
				selectionSquare = b.getElementsByClassName("selected")[0]
				if (selectionSquare) {
					selectPosition = parseInt(selectionSquare.getAttribute("position"))
					moveDestPosition = parseInt(event.target.getAttribute("position"))
					
					placeSquare(b.getElementsByClassName("last-move")[0], selectPosition)
					placeSquare(b.getElementsByClassName("last-move")[1], moveDestPosition)
					executeMove(selectPosition, moveDestPosition)
				}
			}
			deselect()
		}
	}
	
	// Right click to cancel
	if (dragging && (event.button == 2)) {
		deselect()
		
		draggedPiece = event.target
		draggedPiece.classList.remove("dragged")
		resizePiece(draggedPiece)
		ghostPiece.setAttribute("position", -1)
		resizePiece(ghostPiece)
	}
	
	mouseMove(event);
}

function mouseMove(event) {
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	
	if (ghostPiece.getAttribute("position") !== "-1") {
		// Let ghost piece follow the cursor and stay within bound of board
		draggedPiece = b.getElementsByClassName("dragged")[0]
		
		xPos = event.clientX - b.getBoundingClientRect().left - draggedPiece.clientWidth / 2
		yPos = event.clientY - b.getBoundingClientRect().top - draggedPiece.clientHeight / 2
		
		maxX = b.getBoundingClientRect().width - draggedPiece.clientWidth
		maxY = b.getBoundingClientRect().height - draggedPiece.clientHeight
		
		xPos = xPos < 0 ? 0 : xPos
		yPos = yPos < 0 ? 0 : yPos
		xPos = xPos > maxX ? maxX : xPos
		yPos = yPos > maxY ? maxY : yPos
		
		draggedPiece.style.left = xPos
		draggedPiece.style.top = yPos
	}
}

function mouseUp(event) {
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	
	// Snap piece to grid when let go
	if ((event.button == 0) && (ghostPiece.getAttribute("position") !== "-1")) {
		draggedFrom = parseInt(ghostPiece.getAttribute("position"))
		draggedPiece = getPieceAtPosition(draggedFrom)
				
		tileX = Math.floor((draggedPiece.offsetLeft + draggedPiece.offsetWidth / 2) / b.getBoundingClientRect().width * boardWidth)
		tileY = Math.floor((draggedPiece.offsetTop + draggedPiece.offsetHeight / 2) / b.getBoundingClientRect().height * boardHeight)
		
		tileIndex = boardWidth * tileY + tileX
		
		if (tileIndex != draggedFrom) {
			if (getLegalMoves(draggedFrom).includes(tileIndex)) {
				placeSquare(b.getElementsByClassName("last-move")[0], draggedFrom)
				placeSquare(b.getElementsByClassName("last-move")[1], tileIndex)
				executeMove(draggedFrom, tileIndex)
			}
			
			deselect()
		} else {
			selectionSquare = b.getElementsByClassName("select")[0]
			if (selectionSquare.classList.contains("selected")) {
				deselect()
			} else {
				selectionSquare.classList.add("selected")
			}
		}
		
		draggedPiece.classList.remove("dragged")
		ghostPiece.setAttribute("position", -1)
		resizePiece(ghostPiece)
		resizePiece(draggedPiece)
	}
}

function resizePiece(p) {
	i = parseInt(p.getAttribute("position"))
	if (i < 0) {
		p.style.left = 0
		p.style.top = 0
		p.style.width = 0
		p.style.height = 0
		p.style.visibility = "hidden"
	} else {
		t = b.getElementsByClassName("tile")[i]
		p.style.left = t.offsetLeft
		p.style.top = t.offsetTop
		p.style.width = t.offsetWidth
		p.style.height = t.offsetHeight
		p.style.visibility = "visible"
			
		if (p.classList.contains("superparticularis")) {
			p.style.lineHeight = t.offsetHeight * 1.25 + "px"
			p.style.fontSize = t.offsetHeight * 0.30 + "px"
		} else if (p.classList.contains("pyramid")) {
			p.style.lineHeight = t.offsetHeight * 1.15 + "px"
			p.style.fontSize = t.offsetHeight * 0.30 + "px"
		} else if (!p.classList.contains("ghost")) {
			p.style.lineHeight = t.offsetHeight + "px"
			p.style.fontSize = t.offsetHeight * 0.35 + "px"
		}
	}
}

function resizeBoard() {
	b.style.width = b.clientHeight * (boardWidth / boardHeight) + "px"
	
	board.style.fontSize = 0.2 * b.clientHeight / boardHeight
	
	pieces = b.getElementsByClassName("piece")
	// Set everything to 0 so pieces don't resize the board div
	Array.prototype.forEach.call(pieces, p => {
		p.style.left = 0
		p.style.top = 0
		p.style.width = 0
		p.style.height = 0
	})
	Array.prototype.forEach.call(pieces, p => {
		resizePiece(p)
	})
	Array.prototype.forEach.call(b.getElementsByClassName("square"), s => {
		placeSquare(s, parseInt(s.getAttribute("position")))
	})
}