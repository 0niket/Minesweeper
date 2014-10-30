(function(){

    //ms represents the things wich can be changed by user
    //using menu.
    var ms = {
	rows:10,
	cols:10,
	bombs:8
    };

    var game,initFlag = false,explodeFlag=false;
    
    game = initGame(); 
    game.initUI(); //initialize UI
    game.initMouseEvents();//initialize mouse events

    //mouse down function
    function surprise(){
	game.displaySmiley("surprise.png");
    }

    //mouse up function
    function playGame(){
	var id,clickedNode,numberFlag = false;
	game.displaySmiley("smiling.png");
	clickedNode = this;
	id = clickedNode.getAttribute("id");
	id = parseInt(id,10);

	console.log("clicked node: "+id);
	
	//1.generate mines
	//2.calculate values around mines
	//condition : do this only for first attempt
	if(initFlag === false){
	    initFlag = true;
	    game.timer(); //start timer
	    game.plantBombs(id); //plant mines
	    game.calcValues(); //calculating values around mines.
	}
	explodeFlag = game.explodeMines(id);
	if(explodeFlag === true){
	    game.timer("stop");
	    console.log("mines exploded");
	    return false;
	}

	numberFlag = game.displayNumber(id,clickedNode);
	
	if(numberFlag === false){
	    game.traverse(id,clickedNode);
	}
	game.win();
    }
    
    //click smiley function
    function clickSmiley(){
	//clear timer
	game.timer("stop");
	//restart game function here	
    }

    function initGame(){
	//private variables and functions
	var inter,visited=[],tableHtml,smiley,clock,bomb,board,rowsIntoCols,td,colors,values = [],planted = [];
	
	tableHtml = "<table id='blocks'>";
	smiley = document.getElementById("smiley-img");
	clock = document.getElementById("tick");
	bomb = document.getElementById("no-bomb");
	board = document.getElementById("board");
	td = document.getElementsByTagName("td");
	rowsIntoCols = ms.rows * ms.cols;   
	colors = ["blue","green","red","brown","yellow","violet","chocolate","orange"];

	//generate board
	(function generateTable(){
	    var i,j,k=0;
	    for(i=0;i<ms.rows;i+=1){
		tableHtml += "<tr>";
		for(j=0;j<ms.cols;j+=1){
		    tableHtml += "<td id='"+k+"' class='block'></td>";
		    k+=1;
		}
		tableHtml += "</tr>";
	    }
	    tableHtml += "</table>";
	}());

	return{
	    initUI : function(){
		board.innerHTML = tableHtml;
		bomb.innerHTML = ms.bombs;
		clock.innerHTML = "0";
		this.displaySmiley("smiling.png");
		console.log("UI initialized");
	    },
	    displaySmiley : function(img){
		var path = "images/" + img;
 		smiley.setAttribute("src",path);
	    },
	    initMouseEvents : function(){
		for(var i=0;i<td.length;i+=1){
		    td[i].addEventListener("mousedown",surprise,false);
		    td[i].addEventListener("mouseup",playGame,false);
		}
		smiley.addEventListener("click",clickSmiley,false);
	    },
	    removeMouseEvents : function(node){
		node.removeEventListener("mousedown",surprise,false);
		node.removeEventListener("mouseup",playGame,false);
	    },
	    plantBombs : function(id){
		var max = rowsIntoCols-1;
		var random;
		
		for(var j=0;j<ms.bombs;j+=1){
		    random = Math.floor(Math.random() * max);
		    
		    //1.if random no already exist into planted array
		    //2.mines should not explode at 1st attempt
		    if(planted.indexOf(random) !== -1 || id === random){
			console.log("exist in array or clicked node: "+random);
			j--; //to regenerate no. at same index
			continue;
		    }
		    else{
			planted[planted.length] = random;
		    }
		}
		console.log("planted mines: "+planted);
	    },
	    timer :function(op){
		var tick = 0;
		if(op === "stop"){
		    clearInterval(inter);
		    return false;
		}
		inter = setInterval(function(){
		    if(tick <= 999){
			tick += 1;
			clock.innerHTML = tick;
		    }
		    else{
			clearInterval(inter);
		    }
		},1000);
	    },
	    calcValues : function(){
		var z,j,mine,pos,upTd,downTd,currentNode;
		
		//calculating value arround mines
		for(z=0;z<rowsIntoCols;z+=1){
		     values[z] = 0;
		 }
    
		for(j=0;j<planted.length;j+=1){
		    mine = planted[j];
		    mine = td[mine];
		    console.log(mine);

		    if(mine.previousSibling !== null){
			pos = planted[j] - 1;
			values[pos] += 1;
		    }

		    if(mine.nextSibling !== null){
			pos = planted[j] + 1;
			values[pos] += 1;
		    }

		    if(mine.parentNode.previousSibling !== null){
			upTd  = planted[j] - ms.cols;
			values[upTd] += 1; 
			currentNode = td[upTd];

			if(currentNode.previousSibling !== null){
			    pos = upTd - 1;
			    values[pos] += 1;
			}

			if(currentNode.nextSibling !== null){
			    pos = upTd + 1;
			    values[pos] += 1;
			}
		    }

		    if(mine.parentNode.nextSibling !== null){
			downTd = planted[j] + ms.cols;
			values[downTd] += 1;
			currentNode = td[downTd];
			
			if(currentNode.previousSibling !== null){
			    pos = downTd - 1;
			    values[pos] += 1;
			}
		
			if(currentNode.nextSibling !== null){
			    pos = downTd + 1;
			    values[pos] += 1;
			}
		    }
		} //end of value calculation
		console.log("values: "+values);
	    },
	    explodeMines : function(id){
		var z,mine;
		if(planted.indexOf(id) !== -1){
		    for(z=0;z<planted.length;z+=1){
			mine = planted[z];
			mine = td[mine];
			mine.classList.add("blank-block");
			mine.innerHTML = "<img src='images/bomb.png' width='16px'>";
		    }
		    for(z=0;z<td.length;z+=1){
			this.removeMouseEvents(td[z]);
			if(values[z] === 0){
			    this.traverse(z,td[z]);
			}
			else{
			    this.displayNumber(z,td[z]);
			}
		    }
		    this.displaySmiley("sad.png");
		    return true;
		}
		return false;
	    },
	    displayNumber : function(id,currentNode){
		var nodeValue;
		nodeValue = values[id];
		if(nodeValue !== 0 && planted.indexOf(id) === -1){
		    this.removeMouseEvents(currentNode);
		    currentNode.classList.add("blank-block");
		    currentNode.innerHTML = "<b class='node-value' style='color:"+
		                            colors[nodeValue-1]+"'>"+nodeValue+"</b>";
		    return true;
		}
		return false;
	    },
	    traverse : function(k,thisNode){
		var left,right,up,down,id,isMine, upleft,downleft,upright,downright;
		
		if(visited.indexOf(k) !== -1){
		    return false;
		}
		
		left = thisNode.previousSibling;
		right = thisNode.nextSibling;
		up =  thisNode.parentNode.previousSibling;
		down = thisNode.parentNode.nextSibling;
		
		isMine = planted.indexOf(k);
		visited.push(k);
		nodeValue = values[k];

		this.removeMouseEvents(thisNode);

		if(nodeValue === 0 && isMine === -1){
		    thisNode.classList.add("blank-block");
		   
		    if(left !== null){
			this.traverse(k-1, left);
		    }
		    if(right !== null){
			this.traverse(k+1, right);
		    }
		    if(up !== null){
			id = k - ms.cols;
			this.traverse(id, td[id]);
		    }
		    if(down !== null){
			id = k + ms.cols;
			this.traverse(id, td[id]);
		    }
		    if(up !== null && left !== null){
			id = (k-ms.cols)-1;
			this.traverse(id,td[id]);
		    }
		    if(up !== null && right !== null){
			id = (k-ms.cols)+1;
			this.traverse(id,td[id]);
		    }
		    if(down !== null && left !== null){
			id = (k+ms.cols)-1;
			this.traverse(id,td[id]);
		    }
		    if(down !== null && right !== null){
			id = (k+ms.cols)+1;
			this.traverse(id,td[id]);
		    }
		}
		else if(nodeValue !== 0 && isMine === -1){
		    this.displayNumber(k,thisNode);
		}
		
		return true;
	    },
	    win : function(){
		var nodeClass,count=0,i,node;
		for(i=0;i<td.length;i+=1){
		    nodeClass = td[i].classList[1];
		    if(nodeClass === undefined){
			count+=1;
		    }
		}
		if(count === ms.bombs){
		    this.displaySmiley("king.png");
		    for(i=0;i<planted.length;i+=1){
			node = planted[i];
			node = td[node];
			node.innerHTML = "<img src='images/flag.png' width='16px' />";
			this.removeMouseEvents(node);
		    }
		    this.timer("stop");
		}
	    }
	};
    }

}());
