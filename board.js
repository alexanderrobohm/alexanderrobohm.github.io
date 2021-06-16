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

function deselect() {
	selectionSquare = b.getElementsByClassName("select")[0]
	placeSquare(selectionSquare, -1)
	selectionSquare.classList.remove("selected")
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
	// Left click
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	dragging = ghostPiece.getAttribute("position") !== "-1"
	
	if (!dragging && (event.button == 0)) {
		// Drag a piece
		if (event.target.classList.contains("piece")
				&& (event.target.classList.contains(playerToMove == 0 ? "white" : "black"))) {
			draggedPiece = event.target			
			draggedFrom = parseInt(draggedPiece.getAttribute("position"))
			
			ghostPiece.style.left = draggedPiece.offsetLeft
			ghostPiece.style.top = draggedPiece.offsetTop
			ghostPiece.style.width = draggedPiece.offsetWidth
			ghostPiece.style.height = draggedPiece.offsetHeight
			ghostPiece.style.visibility = "visible"
			ghostPiece.style.backgroundImage = getComputedStyle(draggedPiece).getPropertyValue("background-image")
			ghostPiece.style.fontSize = getComputedStyle(draggedPiece).getPropertyValue("font-size")
			ghostPiece.style.lineHeight = getComputedStyle(draggedPiece).getPropertyValue("line-height")
			ghostPiece.style.color = getComputedStyle(draggedPiece).getPropertyValue("color")
			ghostPiece.innerText = draggedPiece.innerText
			
			b.getElementsByClassName("select")[0].style.zIndex = 98
			placeSquare(b.getElementsByClassName("select")[0], draggedFrom)
			
			ghostPiece.setAttribute("position", draggedFrom)
		} else {
			deselect()
		}
	}
	
	// Right click to cancel
	if (dragging && (event.button == 2)) {
		ghostPiece.style.visibility = "hidden"
		ghostPiece.style.width = 0
		ghostPiece.style.height = 0
		ghostPiece.style.top = 0
		ghostPiece.style.left = 0
		b.getElementsByClassName("select")[0].style.zIndex = 96
		
		deselect()
		
		ghostPiece.setAttribute("position", -1)
	}
	
	mouseMove(event);
}

function mouseMove(event) {
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	
	if (ghostPiece.getAttribute("position") !== "-1") {
		// Let ghost piece follow the cursor and stay within bound of board
		xPos = event.clientX - b.getBoundingClientRect().left - ghostPiece.clientWidth / 2
		yPos = event.clientY - b.getBoundingClientRect().top - ghostPiece.clientHeight / 2
		
		maxX = b.getBoundingClientRect().width - ghostPiece.clientWidth
		maxY = b.getBoundingClientRect().height - ghostPiece.clientHeight
		
		xPos = xPos < 0 ? 0 : xPos
		yPos = yPos < 0 ? 0 : yPos
		xPos = xPos > maxX ? maxX : xPos
		yPos = yPos > maxY ? maxY : yPos
		
		ghostPiece.style.left = xPos
		ghostPiece.style.top = yPos
	}
}

function mouseUp(event) {
	ghostPiece = b.getElementsByClassName("ghost")[0]
	
	if (!ghostPiece) { return; }
	
	// Snap piece to grid when let go
	if ((event.button == 0) && (ghostPiece.getAttribute("position") !== "-1")) {
		draggedFrom = parseInt(ghostPiece.getAttribute("position"))
		
		tileX = Math.floor((ghostPiece.offsetLeft + ghostPiece.offsetWidth / 2) / b.getBoundingClientRect().width * boardWidth)
		tileY = Math.floor((ghostPiece.offsetTop + ghostPiece.offsetHeight / 2) / b.getBoundingClientRect().height * boardHeight)
		
		tileIndex = boardWidth * tileY + tileX
		
		if (tileIndex != draggedFrom) {
			if (moveIsLegal(draggedFrom, tileIndex)) {
				executeMove(draggedFrom, tileIndex)
				placeSquare(b.getElementsByClassName("last-move")[0], draggedFrom)
				placeSquare(b.getElementsByClassName("last-move")[1], tileIndex)
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
		
		ghostPiece.style.visibility = "hidden"
		ghostPiece.setAttribute("position", -1)
		b.getElementsByClassName("select")[0].style.zIndex = 96
	}
}

function resizePiece(p) {
	i = parseInt(p.getAttribute("position"))
	if (i < 0) { return; }
	
	t = b.getElementsByClassName("tile")[i]
	p.style.left = t.offsetLeft
	p.style.top = t.offsetTop
	p.style.width = t.offsetWidth
	p.style.height = t.offsetHeight
	p.style.fontSize = t.offsetHeight * 0.35 + "px"
	if (p.classList.contains("superparticularis")) {
		p.style.lineHeight = t.offsetHeight * 1.25 + "px"
		p.style.fontSize = t.offsetHeight * 0.30 + "px"
	} else if (p.classList.contains("pyramid")) {
		p.style.lineHeight = t.offsetHeight * 1.15 + "px"
		p.style.fontSize = t.offsetHeight * 0.30 + "px"
	} else {
		p.style.lineHeight = t.offsetHeight + "px"
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