function go(controller) {
	
	var header = document.getElementById("playerStatus");
	var status = document.createElement('span');
	header.appendChild(status);
	
	//make chess table
    var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
    for (var i = 0; i < 8; ++i) {
		var row = document.createElement("tr");
        row.setAttribute('id', i);
        for (var j = 0; j < 8; ++j) {
			var cell = document.createElement('td');
			cell.setAttribute('id', i.toString()+j.toString());
			cell.addEventListener("click", selectCell, false);
			row.appendChild(cell);
        }
		tbody.appendChild(row);
    }
	var board = document.getElementById('chesstable');
	board.appendChild(table);
	
	//make tables for the white and black captured
	var capturedArea = document.getElementById("captured");
	var capturedTable = document.createElement("table");
	capturedArea.appendChild(capturedTable);
	for (var i = 0; i < 8; ++i) {
		var row = document.createElement("tr");
        row.setAttribute('id', "c" +i.toString());
        for (var j = 0; j < 4; ++j) {
			var cell = document.createElement('td');
			cell.setAttribute('id', "c"+i.toString()+j.toString());
			row.appendChild(cell);
        }
		capturedTable.appendChild(row);
    }
	
	//put the pieces in the initial state - call function from controller
	init();
	
	//reset button - call init()
	document.getElementById('resetButton').onclick = function(){init()};
	
	function init(){
		//draw([]) 
		//draw board
		//delete all current img in cells
		for (var i=0;i<8;++i){
			for (var j=0;j<8;++j) {
				let cell = document.getElementById(i+""+j)
				while (cell.lastChild) {
					cell.removeChild(cell.lastChild);
				}
			}
		}
		var initialArray = controller.init();
		initialArray.forEach( function (arrayItem)
				{
					var cell = document.getElementById(arrayItem.x.toString()+arrayItem.y.toString());
					var img = document.createElement('img');
					img.setAttribute('src', arrayItem.src);
					cell.appendChild(img);
				});
		
		//init header
		status.innerHTML = "<h4>" + controller.getCurrentPlayer() + " player's turn!</h4>Board strength ratio: " + controller.getChancesOfWinning() + "%";
	}
	
	
	
	var idsArray = null;
	var selectedx = null;
	var selectedy = null;
	var selectedid = null;


	function selectCell(e){
		if(controller.getStatus() != "Transform" && controller.getStatus() != "Checkmate" && controller.getStatus() != "Draw" && controller.getCurrentPlayer() === "WHITE"){
		if(idsArray === null){ //if user doesn't have highlighted cells
			selectedid = this.id;
			selectedx = parseInt(selectedid.charAt(0));
			selectedy = parseInt(selectedid.charAt(1));
			var availableMoves = controller.getAvailableMoves(selectedx,selectedy); // getting the list with available moves
			
			if(availableMoves.length === 0){ //if the user clicked on an empty cell or enemy piece
				return;
			}else{
			//transform the listMoves in string with map so you get the ids
				idsArray = availableMoves.map(function(obj) { 
					var ids = [];
					ids.push(obj.x.toString() + obj.y.toString());
					return ids;
				});
				idsArray.push(this.id);
			//highlight valid cells in view
				idsArray.forEach( function (arrayItem)
				{
					document.getElementById(arrayItem).style.borderColor = "blue";
					document.getElementById(arrayItem).style.borderWidth = "8px";
				});
			}
		}else{//user has highligted moves
			//check the list to see if the cell clicked is highlighted with array.find in availableCells and call function move
			var idClicked = this.id;
			var x2 = parseInt(idClicked.charAt(0));
			var y2 = parseInt(idClicked.charAt(1));
			if(idsArray.find(el => idClicked == el) == undefined){
				return;
			}else{
				if(idClicked == selectedid){
					//if where i clicked second time is on the same coorditates, deselect piece
					idsArray.forEach( function (arrayItem){
						document.getElementById(arrayItem).style.borderColor = "#000";
						document.getElementById(arrayItem).style.borderWidth = "1px";
					});
					idsArray = null;
					selectedx = null;
					selectedy = null;
					selectedid = null;
				}else{
					var newBoard = controller.move(selectedx, selectedy, x2, y2, this); // returns an updated array of all cells	
					//redraw board
					console.log(newBoard)
					draw(newBoard);
					controller.getServerMove(draw)					
				}
				if(idsArray!==null) 
				{
					//take the highlight out from cells in list
					idsArray.forEach( function (arrayItem){
						let el = document.getElementById(arrayItem)
						if(el !== null) 
						{
							el.style.borderColor = "#000";
							el.style.borderWidth = "1px";
						}
					});
				}
				
				idsArray = null;
				selectedx = null;
				selectedy = null;
				selectedid = null;
				
				if(controller.getStatus() === "Transform"){
					//create menu table for when in transform game status
					var menuArea = document.getElementById("piecemenu");
					var menuTable = document.createElement("table");
					menuArea.appendChild(menuTable);
					for (var i = 0; i < 4; ++i) {
						var row = document.createElement("tr");
						var cell = document.createElement('td');
						cell.setAttribute('id', "m"+i.toString());
						row.appendChild(cell);
						menuTable.appendChild(row);
					}
					document.getElementById("menuTitle").innerHTML = "<span><h3>Choose new piece</h3></span>";
					let pieceArray = controller.getCurrentPlayer() === "WHITE" ?
						 ["pieces/wb.png", "pieces/wn.png", "pieces/wr.png", "pieces/wq.png"]
						 :
						 ["pieces/bb.png", "pieces/bn.png", "pieces/br.png", "pieces/bq.png"]
					for (var i = 0; i < 4; ++i) {
						var cell = document.getElementById("m"+i.toString());
						cell.addEventListener("click",  function(e){selectHero(e.srcElement.parentElement.id);}, false);
						var img = document.createElement('img');
						img.setAttribute('src', pieceArray[i]);
						cell.appendChild(img);
					}
				}
				if(controller.getStatus() != "Normal" && controller.getStatus() != "Transform" ){
					status.innerHTML = "<h4>" + controller.getCurrentPlayer() + " player's turn! - " + controller.getStatus() +"</h4>Board strength ratio: " + controller.getChancesOfWinning() + "%";
				}
			}
		}
		}
	
	}
	
	function selectHero(src){
		var newBoard = undefined
		switch(src) {
			case "m0":
				newBoard = controller.transform(PieceType.BISHOP);
				break;
			case "m1":
				newBoard = controller.transform(PieceType.KNIGHT);
				break;
			case "m2":
				newBoard = controller.transform(PieceType.ROOK);
				break;
			case "m3":
				newBoard = controller.transform(PieceType.QUEEN);
				break;
			default:
				console.log("Invalid transform table td id")
				break;
		}
		//replace the selected piece with the one clicked
		
		draw(newBoard);
		
		//delete table
		var div = document.getElementById("piecemenu");
		while (div.lastChild) {
			div.removeChild(div.lastChild);
		}
		document.getElementById("menuTitle").innerHTML = "";
		
		if(controller.getStatus() != "Normal" && controller.getStatus() != "Transform" ){
					status.innerHTML = "<h4>" + controller.getCurrentPlayer() + " player's turn! - " + controller.getStatus() +"</h4>Board strength ratio: " + controller.getChancesOfWinning() + "%";
				}
	}
	
	function draw(newBoard){
		//delete all current img in cells
		for (var i=0;i<8;++i){
			for (var j=0;j<8;++j) {
				var cell = document.getElementById(i+""+j)
				while (cell.lastChild) {
					cell.removeChild(cell.lastChild);
				}
			}
		}
		//delete all img from captured table
		for (var i=0;i<8;++i){
			for (var j=0;j<4;++j) {
				var cell = document.getElementById("c"+i+""+j);
				while (cell.lastChild) {
					cell.removeChild(cell.lastChild);
				}
			}
		}
		var xWhiteCaptured = 0;
		var yWhiteCaptured = 0;
		var xBlackCaptured = 4;
		var yBlackCaptured = 0;
		//put pieces in captured table or on chess table
		newBoard.forEach( function (arrayItem){
			if(!arrayItem.isCaptured){
				var cell = document.getElementById(arrayItem.x +""+ arrayItem.y);
				var img = document.createElement('img');
				img.setAttribute('src', arrayItem.src);
				cell.appendChild(img);
			}else{
				//put the new pieces
				var color = arrayItem.src.charAt(arrayItem.src.length-6);
				if(color === 'w'){
					var cell = document.getElementById("c" + xWhiteCaptured + "" + yWhiteCaptured);
					var img = document.createElement('img');
					img.setAttribute('src', arrayItem.src);
					cell.appendChild(img);
					yWhiteCaptured ++;
					if(yWhiteCaptured === 4){
						xWhiteCaptured ++;
						yWhiteCaptured = 0;
					}
				}else{
					var cell = document.getElementById("c" + xBlackCaptured+ "" + yBlackCaptured);
					var img = document.createElement('img');
					img.setAttribute('src', arrayItem.src);
					cell.appendChild(img);
					yBlackCaptured ++;
					if(yBlackCaptured === 4){
						xBlackCaptured ++;
						yBlackCaptured = 0;
					}
				}
			}
		});
					
		//recalculate chances of winning
		status.innerHTML = "<h4>" + controller.getCurrentPlayer() + " player's turn!</h4>Board strength ratio: " + controller.getChancesOfWinning() + "%";
	}
	
}
