(function startGame(){
    var minesweeper = {
	rows:10,
	cols:10,
	bombs:8,
	inter:0,
	values:[]
    };
 
   
    //Draw board
    
    (function initUI (){
	//variables required for UI
	var i,j,k=0,smiley;
	var html="<table id='blocks'>";

	//set happy smiley
	smiley = document.getElementById("smiley-img");
	smiley.setAttribute("src","images/smiling.png");
	document.getElementById("tick").textContent = "0";
	//To display blocks
	for(i=0;i<minesweeper.rows;i+=1){
	    html += "<tr>";
	    for(j=0;j<minesweeper.cols;j+=1){
		html += "<td id='"+k+"'  class='block'></td>";
		k+=1;
	    }
	    html += "</tr>";
	}
	html += "</table>";
	document.getElementById("board").innerHTML = html;
	//end of display blocks

	//display no of bombs
	document.getElementById("no-bomb").innerHTML = minesweeper.bombs;
	//end of display bombs

    }());

    //click on block
    
    function clickTd (){
	var td = document.getElementsByTagName("td"),openBlocks=0;
	var planted = [],initFlag = false,smiley = document.getElementById("smiley-img");

	//randomly plant bomb
	function plantBombs (id) {
	    var max = (minesweeper.rows * minesweeper.cols)-1;
	    var random;
	    
	    for(var j=0;j<minesweeper.bombs;j+=1){
		random = Math.floor(Math.random() * max);
				
		//1.if random no already exist into planted array
		//2.mines should not explode at 1st attempt
		if(planted.indexOf(random) !== -1 || id === random){
		    console.log("exist in array: "+random);
		    j--; //to regenerate no. at same index
		    continue;
		}
		else{
		    planted[planted.length] = random;
		}
	    }
	    
	}
	//end of randomly plant bomb
	
	//click callback function
	var playGame = function (){
	    var mine,currentNode,pos,upTd,downTd,clickedNode,i,j,z;
	    var tick=0,ticker = document.getElementById("tick");
	    var nodeValue,leftNode,rightNode;
	    console.log("opened blocks: "+openBlocks);
	    smiley.setAttribute("src","images/smiling.png");
	    
	    clickedNode = this.getAttribute("id");
	    clickedNode = parseInt(clickedNode,10);
	    
	    console.log(clickedNode);
		
	    //mines should not explode at first attempt
	    if(initFlag === false){
		
		initFlag = true;

		//timer starts
		minesweeper.inter = setInterval(function(){
		tick += 1;
		if(tick<=999){
		    ticker.innerHTML = tick;
		}
		else{
		    clearInterval(minesweeper.inter);
		}
	  
		},1000);
		//timer ends

		//plant mines
		plantBombs(clickedNode);
		console.log(planted);
		//plant mines end


		//calculating value arround mines
		for(z=0;z<(minesweeper.rows*minesweeper.cols);z+=1){
		     minesweeper.values[z] = 0;
		 }
    
		for(j=0;j<planted.length;j+=1){
		    mine = document.getElementById(planted[j]);
		    console.log(mine);

		    if(mine.previousSibling !== null){
			pos = planted[j] - 1;
			minesweeper.values[pos] += 1;
		    }

		    if(mine.nextSibling !== null){
			pos = planted[j] + 1;
			minesweeper.values[pos] += 1;
		    }

		    if(mine.parentNode.previousSibling !== null){
			upTd  = planted[j] - minesweeper.cols;
			minesweeper.values[upTd] += 1; 
			currentNode = document.getElementById(upTd);

			if(currentNode.previousSibling !== null){
			    pos = upTd - 1;
			    minesweeper.values[pos] += 1;
			}

			if(currentNode.nextSibling !== null){
			    pos = upTd + 1;
			    minesweeper.values[pos] += 1;
			}
		    }

		    if(mine.parentNode.nextSibling !== null){
			downTd = planted[j] + minesweeper.cols;
			minesweeper.values[downTd] += 1;
			currentNode = document.getElementById(downTd);
			
			if(currentNode.previousSibling !== null){
			    pos = downTd - 1;
			    minesweeper.values[pos] += 1;
			}
		
			if(currentNode.nextSibling !== null){
			    pos = downTd + 1;
			    minesweeper.values[pos] += 1;
			}
		    }
		} //end of value calculation
		console.log(minesweeper.values);
	    }//end of mines should not explode at first attempt
	    
	    //explode mines
	    if(planted.indexOf(clickedNode) !== -1){
		for(z=0;z<planted.length;z+=1){
		    mine = document.getElementById(planted[z]);
		    mine.classList.add("blank-block");
		    mine.innerHTML = "<img src='images/bomb.png' width='16px'>";
		}
		for(var i=0;i<td.length;i+=1){
		    td[i].removeEventListener('mousedown', surprise, false);
		    td[i].removeEventListener('mouseup', playGame,false);
		}
		clearInterval(minesweeper.inter); // stopping timer
		smiley.setAttribute("src","images/sad.png");
		//lost game
		return false;
	    }
	    //explode mines end
	    
	    //clicked node has value other than 0
	    nodeValue = minesweeper.values[clickedNode];
	    currentNode = document.getElementById(clickedNode);
	    if(nodeValue !== 0 && planted.indexOf(clickedNode) === -1){
		currentNode.classList.add("blank-block");
		currentNode.innerHTML = "<b class='node-value'>"+nodeValue+"</b>";
		openBlocks += 1;
	    }
	    else if(nodeValue === 0 && planted.indexOf(clickedNode) === -1){
		//for blank spaces i.e value is 0
		var visited = [];
		var count=0; //recursion counter
		
		function traverse(k,thisNode){
		
		    var left,right,up,down,id,isMine;
		    var upleft,downleft,upright,downright;
		    count+=1;
		    
		    if(visited.indexOf(k) !== -1){
			return false;
		    }
		    
		    left = thisNode.previousSibling;
		    right = thisNode.nextSibling;
		    up =  thisNode.parentNode.previousSibling;
		    down = thisNode.parentNode.nextSibling;
		    
		    isMine = planted.indexOf(k);
		    visited.push(k);
		    nodeValue = minesweeper.values[k];

		    thisNode.removeEventListener('mouseup', playGame, false);
		    thisNode.removeEventListener('mousedown', surprise, false);

		    if(nodeValue === 0 && isMine === -1){
			thisNode.classList.add("blank-block");
			openBlocks +=1;
			if(left !== null){
			    traverse(k-1, left);
			}
			if(right !== null){
			    traverse(k+1, right);
			}
			if(up !== null){
			    id = k - minesweeper.cols;
			    up = document.getElementById(id);
			    traverse(id, up);
			}
			if(down !== null){
			    id = k + minesweeper.cols;
			    down = document.getElementById(id);
			    traverse(id, down);
			}
			if(up !== null && left !== null){
			    id = (k-minesweeper.cols)-1;
			    upleft = document.getElementById(id);
			    traverse(id,upleft);
			}
			if(up !== null && right !== null){
			    id = (k-minesweeper.cols)+1;
			    upright = document.getElementById(id);
			    traverse(id,upright);
			}
			if(down !== null && left !== null){
			    id = (k+minesweeper.cols)-1;
			    downleft = document.getElementById(id);
			    traverse(id,downleft);
			}
			if(down !== null && right !== null){
			    id = (k+minesweeper.cols)+1;
			    downright = document.getElementById(id);
			    traverse(id,downright);
			}
		    }
		    else if(nodeValue !== 0 && isMine === -1){
			openBlocks +=1;
			thisNode.classList.add("blank-block");
			thisNode.innerHTML = "<b class='node-value'>"+nodeValue+"</b>";
		    }
		    
		    return false;
		}

		traverse(clickedNode,currentNode);
		console.log("recursion function called : " +count+ " times");
		//end of blank spaces
	    }

	    if(openBlocks === ((minesweeper.rows * minesweeper.cols) - minesweeper.bombs)){
		alert("Congrats!!! You WIN : " + openBlocks);
	    }
	    
	};

	function surprise(){
		smiley.setAttribute("src","images/surprise.png");
	}
	
	//attaching click listener
	for(var i=0;i<td.length;i+=1){
	    
	    td[i].addEventListener('mousedown', surprise, false);

	    td[i].addEventListener('mouseup', playGame, false);
	    
	}


    }
    
    clickTd();

    function clickSmiley(){
	//clear timer
	clearInterval(minesweeper.inter);
	startGame();	//becomes recursive very problematic	
    }
    
    (function attachSmileyEvent(){
	smiley = document.getElementById("smiley-img");
	smiley.addEventListener('click', clickSmiley,false);
    }()); 
    
}());
