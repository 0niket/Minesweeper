(function(){
    var minesweeper = {
	rows:10,
	cols:10,
	bombs:8,
	values:[]
    };
 
   
    //Draw board
    
    (function initUI (){
	//variables required for UI
	var i,j,k=0;
	var html="<table id='blocks'>";

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
	var td = document.getElementsByTagName("td");
	var planted = [],initFlag = false,inter;

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
	    
	    clickedNode = this.getAttribute("id");
	    clickedNode = parseInt(clickedNode,10);
	    
	    console.log(clickedNode);
		
	    //mines should not explode at first attempt
	    if(initFlag === false){
		
		initFlag = true;

		//timer starts
		inter  = setInterval(function(){
		tick += 1;
		if(tick<=999){
		    ticker.innerHTML = tick;
		}
		else{
		    clearInterval(inter);
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
		    clearInterval(inter);
		}
	    }
	    //explode mines end
	    
	    //clicked node has value other than 0
	    nodeValue = minesweeper.values[clickedNode];
	    currentNode = document.getElementById(clickedNode);
	    if(nodeValue !== 0){
		currentNode.classList.add("blank-block");
		currentNode.innerHTML = "<b class='node-value'>"+nodeValue+"</b>";
	    }
	    else{
		//for blank spaces i.e value is 0

		function goLeft(left){
		    var thisNode = document.getElementById(left);
		    nodeValue = minesweeper.values[left];
		    if(nodeValue === 0 && planted.indexOf(left) === -1){
			thisNode.classList.add("blank-block");
			if(thisNode.previousSibling !== null){
			    goLeft(left-1);
			}
		    }
		    return false;
		}
		
		function goRight(right){
		    var thisNode = document.getElementById(right);
		    nodeValue = minesweeper.values[right];
		    if(nodeValue === 0 && planted.indexOf(right) === -1){
			thisNode.classList.add("blank-block");
			if(thisNode.nextSibling !== null){
			    goRight(right+1);
			}
		    }
		    return false;

		}
		
		function goUp(up){
		    var thisNode = document.getElementById(up);
		    nodeValue = minesweeper.values[up];
		    if(nodeValue === 0 && planted.indexOf(up)===-1 ){
			thisNode.classList.add("blank-block");
			if(thisNode.parentNode.previousSibling !== null){
			    goUp(up - minesweeper.cols);
			}
			if(thisNode.previousSibling !== null){
			    goLeft(up-1);
			}
			if(thisNode.nextSibling !== null){
			    goRight(up+1);
			}
		    }
		    return false;
		}

		function goDown(down){
		    var thisNode = document.getElementById(down);
		    nodeValue = minesweeper.values[down];
		    if(nodeValue === 0 && planted.indexOf(down)=== -1){
			thisNode.classList.add("blank-block");
			if(thisNode.parentNode.nextSibling !== null){
			    goDown(down + minesweeper.cols);
			}
			if(thisNode.previousSibling !== null){
			    goLeft(down-1);
			}
			if(thisNode.nextSibling !== null){
			    goRight(down+1);
			}
		    }
		    return false;
		}
		
		currentNode.classList.add("blank-block");
		if(currentNode.parentNode.previousSibling !== null){
		    goUp(clickedNode - minesweeper.cols);
		    console.log("here1");
		}
		if(currentNode.parentNode.nextSibling !== null){
		    goDown(clickedNode + minesweeper.cols);
		    console.log("here2");
		}
		/*
		if(currentNode.previousSibling !== null){
		    goLeft(clickedNode - 1);
		    console.log("here3");
		}
		if(currentNode.nextSibling !== null){
		    goRight(clickedNode + 1);
		    console.log("here4");
		}*/
		
		
		i=clickedNode - 1;
		leftNode = currentNode;
		while(leftNode.previousSibling !== null){
		    leftNode = leftNode.previousSibling;
		   
		    nodeValue = minesweeper.values[i];
		    if(nodeValue === 0 && planted.indexOf(i)===-1){
			leftNode.classList.add("blank-block");
			
			if(leftNode.parentNode.previousSibling !== null){
			    goUp(i - minesweeper.cols);
			    console.log("here3");
			}
		    
			if(leftNode.parentNode.nextSibling !== null){
			    goDown(i + minesweeper.cols);
			    console.log("here4");
			}
		    }
		    
		    i-=1;
		}

		i=clickedNode + 1;
		rightNode = currentNode;
		while(rightNode.nextSibling !== null){
		    rightNode = rightNode.nextSibling;
		    console.log("here5");
		    nodeValue = minesweeper.values[i];
		    if(nodeValue === 0 && planted.indexOf(i)===-1){
			rightNode.classList.add("blank-block");

			if(rightNode.parentNode.previousSibling !== null){
			    goUp(i - minesweeper.cols);
			    console.log("here6");
			}
			
			if(rightNode.parentNode.nextSibling !== null){
			    goDown(i + minesweeper.cols);
			    console.log("here7");
			}
		    }
		    i+=1;
		}
		
		//end of blank spaces
	    }
	    
	};
	
	//attaching click listener
	for(var i=0;i<td.length;i+=1){
	    td[i].addEventListener('click', playGame, false);
	}

    }
    
    clickTd();

}());
