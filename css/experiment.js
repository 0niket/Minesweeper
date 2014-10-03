function initGame(){
    var minesweeper = {};
    minesweeper.rows = 10;
    minesweeper.cols = 10;
    minesweeper.bombs = 8;

    minesweeper.createBlocks = function (){
	var i,j;
	var html="<table id='blocks'>";
	for(i=0;i<minesweeper.rows;i+=1){
	    html += "<tr>";
	    for(j=0;j<minesweeper.cols;j+=1){
		html += "<td class='block'></td>";
	    }
	    html += "</tr>";
	}
	html += "</table>";
	document.getElementById("board").innerHTML = html;
    };

    minesweeper.numberOfBombs = function (){
	document.getElementById("no-bomb").innerHTML = minesweeper.bombs;
    };

    
    minesweeper.timer = function () {
	var i = 0;
	var ticker = document.getElementById("tick");
	var inter = setInterval(function(){
	    i += 1;
	    if(i<=999){
		ticker.innerHTML = i;
	    }
	    else{
		clearInterval(inter);
	    }
	  
	},1000);
    };
    
      
    minesweeper.timer();
    minesweeper.numberOfBombs ();
    minesweeper.createBlocks ();

}

initGame();
