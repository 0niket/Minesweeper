(function () {
   
    function gameObject() {
	//ms represents constants used in game and variables that can be manipulated through menu
	var ms = {
	    rows: 10,
	    cols: 10,
	    bombs: 8,
	    path: "images/",
	    images: {
		surprise: "surprise.png",
		smiling: "smiling.png",
		sad: "sad.png",
		bomb: "bomb.png",
		flag: "flag.png",
		king: "king.png",
		explosion: "exploding.png",
		crossbomb: "crossbomb.png"
	    },
	    colors: ["blue","green","red","purple","maroon","cyan","black","grey"]
	};
	
	return {
	    getObject: function () {  //to provide security to ms object 
		return ms;
	    },
	    setObject: function (rows, cols, bombs) { //set variables of game using menu
		ms.rows = rows;
		ms.cols = cols;
		ms.bombs = bombs;
		return ms;
	    } 
	};
    }

    
    var start, url;
    url = "";

    (function loadResources() {
	//preload all images for better gameplay.
	var img = [], width = 16, ms;
	ms = gameObject().getObject();
	for (var image in ms.images) {
	    if( ms.images.hasOwnProperty( image ) ) {
		img[image] = new Image(width);
		img[image].src = ms.path + ms.images[image];
	    } 
	}
	
	start = initGame();
	start.initEvents();
	
	//load level depending on url
	url = window.location.href;
	gameMenu();
    }());

    // change UI and game variables as per selected level
    function gameMenu() {
	var radio, smiley, clock, game, ms, menu;
	
	menu = {
	    urls: {
		online1: "http://aniket19.github.io/Minesweeper/index.html",
		online2: "http://aniket19.github.io/Minesweeper/",
		local: "file:///home/aniket/Minesweeper/index.html"
	    },
	    pages: {
		beginner: {
		    gameMargine: "game-level1",
		    smileyDistance: "smiley-space1",
		    level: "beginner",
		    rows: 10,
		    cols: 10,
		    bombs: 8,
		    title: "Minesweeper - level 1",
		    url: "?level=beginner"
		},
		intermediate: {
		    gameMargine: "game-level2",
		    smileyDistance: "smiley-space2",
		    level: "intermediate",
		    rows: 16,
		    cols: 16,
		    bombs: 40,
		    title: "Minesweeper - level 2",
		    url: "?level=intermediate"
		},
		expert: {
		    gameMargine: "game-level3",
		    smileyDistance: "smiley-space3",
		    level: "expert",
		    rows: 16,
		    cols: 30,
		    bombs: 99,
		    title: "Minesweeper - level 3",
		    url: "?level=expert"
		}
	    }
	};
	
	radio = document.getElementsByName("level");
	smiley = document.getElementById("smiley-img");
	clock = document.getElementById("clock-img");

	game = document.getElementById("game");

	ms = gameObject();

	history.replaceState(null, '', '');

	switch (url) {
	    case menu.urls.online1 + menu.pages.intermediate.url: 
	    case menu.urls.online2 + menu.pages.intermediate.url: 
	    case menu.urls.local + menu.pages.intermediate.url: 
	         levelSelected("intermediate"); 
	         break;

	    case menu.urls.online1 + menu.pages.expert.url: 
	    case menu.urls.online2 + menu.pages.expert.url: 
	    case menu.urls.local + menu.pages.expert.url: 
	         levelSelected("expert"); 
	         break;

	    default: 
	         levelSelected("beginner"); 
	         break;
	}
		
	function levelSelected(level) {
	    
	    var ob = ms.setObject(menu.pages[level].rows, menu.pages[level].cols, menu.pages[level].bombs)
	    ,levelarray = ["beginner","intermediate","expert"];

	    document.title = menu.pages[level].title;

	    game.classList.add(menu.pages[level].gameMargine);
	    smiley.classList.add(menu.pages[level].smileyDistance);
	    clock.classList.add(menu.pages[level].smileyDistance);
	    
	    levelarray.forEach(function (element, index) {
		if (element !== level) {
		    game.classList.remove(menu.pages[element].gameMargine);
		    smiley.classList.remove(menu.pages[element].smileyDistance);
		    clock.classList.remove(menu.pages[element].smileyDistance);
		}
		else {
		    radio[index].checked = true;
		}
	    });

	    start.resetTimer();
	    start.initUI(ob);
	}

	for (var radioIndex = 0; radioIndex < radio.length; radioIndex += 1) {
	    radio[radioIndex].addEventListener("click", function () {
		history.pushState(menu.pages[this.value], menu.pages[this.value].title, menu.pages[this.value].url);
		levelSelected(this.value);
	    }, false);
	}

	window.addEventListener("popstate", function (event) {
	    if (event.state !== null) {
		levelSelected(event.state.level);
	    }
	},false);
    }

    function initGame() {
	
	var game;
	// The game object is divided in three parts model(data),view(UI) & controller
	game = {
	    data: {
		tiles: [],
		ms: undefined,
		table: document.getElementById("blocks"),
		smiley: document.getElementById("smiley-img"),
		clock: document.getElementById("tick"),
		bomb: document.getElementById("no-bomb"),
		template: "",
		inter: undefined,
		bombs: 0,
		isInitialized: false,
		hasExploded: false,
		isTimeOver: false,
		rowsIntoCols: 0 
	    },
	    ui: {
		//to set image for tile. e.g: on explode tile image should be bomb.png
		setNodeImage: function(node, img) {
		    node.innerHTML = "<img src='"+img+"' width='16px' />";
		},
		//turn clicked bomb background to red
		clickedMine: function(node) {
		    node.classList.add("red-block");
		},
		//Sets background and displays value of node except -1 and 0
		exploreNode: function(node, no) {
		    node.classList.add("blank-block");
		    if (no > 0) {
			node.innerHTML =  "<b class='node-value' style='color:"+
		                            game.data.ms.colors[no-1]+"'>"+no+"</b>";
		    }
		},
		//Implementation of micro template to generate table
		generateTable: function() {

		    //This function is called once in lifetime of game.
		    //table is getting  stored in game.data.template
		    //which can be used for game reset.

		    var tdTemplate, tempTdTemplate, trTemplate, startIndex, finishIndex;
		    
		    game.data.template = "<tr>" +
                                              "<td id='{id}' class='block'></td>" +
                                         "</tr>";
		  
		    //Extracting td out of html content
		    tdTemplate = "<td id='{id}' class='block'></td>";
		    tempTdTemplate = tdTemplate;

		    //generate table cols
		    tdTemplate = tdTemplate.replace(tdTemplate, function () {
			var tempTemplate = "";
			for (var tdIndex = 0; tdIndex < game.data.ms.cols; tdIndex += 1) {
			    tempTemplate += "\n\t\t\t" + tdTemplate; 
			}
			return tempTemplate;
		    });
		

		    trTemplate = game.data.template.replace(tempTdTemplate,tdTemplate);


		    //generate table rows and replace {row} part of id
		    game.data.template = trTemplate.replace(trTemplate, function () {
			var tempTemplate="", id=0;
			for (var trIndex = 0; trIndex < game.data.ms.rows; trIndex += 1) {
			    tempTemplate += trTemplate;
			    for (var tdIndex = 0; tdIndex < game.data.ms.cols; tdIndex += 1){
				tempTemplate = tempTemplate.replace("{id}",id);
				id += 1;
			    }
			}
			return tempTemplate;
		    });

		}
		
	    },
	    controllers: {
		//Data structure for each tile
		Tile: function(value, cell, left, right, up, down, isFlag, isVisited, eventAttached) {
		    this.value = value;
		    this.cell = cell;
		    this.left = left;
		    this.right = right;
		    this.up = up;
		    this.down = down;
		    this.isFlag = isFlag;
		    this.isVisited = isVisited;
		    this.eventAttached = eventAttached;
		    return this;
		},
		//Adds data structure of each tile to array called tiles
		addToTiles: function() {
		    var td, tempTile, length = 0, node, left, right, up, down;
		    td = document.getElementsByTagName("td");

		    while (game.data.tiles.length < game.data.rowsIntoCols) {
			length = game.data.tiles.length;

			node = [];

			node[0] = td[length];//node
			
			left = node[0].previousElementSibling;
			right = node[0].nextElementSibling;
			up = node[0].parentNode.previousElementSibling;
			down = node[0].parentNode.nextElementSibling;
			
			
			if (left !== null) {
			    node[1] = td[length - 1];//left
			}
			if (right !== null) {
			    node[2] = td[length + 1];//right
			}
			if (up !== null) {
			    node[3] = td[length - game.data.ms.cols];//up
			}
			if (down !== null) {
			    node[4] = td[length + game.data.ms.cols];//down
			}
			
			
			tempTile = new game.controllers.Tile(0
							     ,node[0]
							     ,node[1]
							     ,node[2]
							     ,node[3]
							     ,node[4]
							     ,false
							     ,false
							     ,true); 
			game.data.tiles[length] = tempTile;
		    }
		},
		//Displays surprise smiley on mouse down
		surprise: function() {
		    game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.surprise);
		},
		//executes all game functions on mouse up  
		clickToPlay: function(target, id){
		
		    game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.smiling);

		    //1.generate mines
		    //2.calculate values around mines
		    //condition : do this only for first attempt
		    if (game.data.isInitialized === false) {
			game.data.isInitialized = true;
			game.controllers.timer(); //start timer
			game.controllers.plantBombs(id); //plant mines
			game.controllers.calcValues(); //calculating values around mines.
		    }
		    
		    //if mines explode then stop the game
		    game.controllers.explodeMines(id); 
		    if (game.data.hasExploded === true) {
			return false;
		    }
		    
		    //traverse nodes & check if user has won the game
		    game.controllers.traverse(id, target);
		    game.controllers.win();
		},
		//reset game when user clicks smiley
		reset: function() {
		    game.controllers.timer("stop");
		    game.data.table.innerHTML = game.data.template;
		    game.data.bomb.innerHTML = game.data.ms.bombs;
		    game.data.clock.innerHTML = "0";
		    game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.smiling);
		    game.data.isInitialized = false;
		    game.data.hasExploded = false;
		    game.data.isTimeOver = false;
		    game.data.tiles = [];
		    game.controllers.addToTiles();
		    game.data.bombs = game.data.ms.bombs;
		},
		//add or remove flag node on right click
		flagNode: function(node, id) {

		    game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.smiling);
		    
		    if (game.data.tiles[id].isFlag === false) {
			if (game.data.bombs > 0) {
			    game.ui.setNodeImage(node, game.data.ms.path + game.data.ms.images.flag);
			    game.data.tiles[id].isFlag = true;
			    game.controllers.removeMouseEvents(id);
			    game.data.bombs -= 1;
			}
		    } 
		    else {
			if(game.data.bombs < game.data.ms.bombs) {
			    node.innerHTML = "";
			    game.data.tiles[id].isFlag = false;
			    game.data.tiles[id].eventAttached = true;
			    game.data.bombs += 1;
			}
		    }

		    game.data.bomb.innerHTML = game.data.bombs;
		},
		//initialize all the mouse events
		initMouseEvents: function() {
		    //prevent default right click event of browser
		    window.addEventListener("contextmenu", function (e) {
			e.preventDefault();
		    }, false);
		    
		    game.data.table.addEventListener("mousedown", function (e) {
			var target;
			e = e || window.event;
			target = e.target;

			if(target && target.nodeName === "TD") {
			    id = target.getAttribute("id");
			    id = parseInt(id, 10);
			    if (game.data.tiles[id].eventAttached === true) {
				game.controllers.surprise();
			    } 
			}
			
		    }, false);
		    
		    //Event is only attached to parent node 
		    //through event bubbling it finds the clicked node
		    //if user clicks left click then executes clicktoplay func
		    //otherwise it excutes flagNode function
		    game.data.table.addEventListener("mouseup", function (e) {
			var id,btnCode,target;

			e = e || window.event;
			target = e.target;
			btnCode = e.button;
			
			 while(target != game.data.table) { 
			     if (target.nodeName == 'TD') {
				 id = target.getAttribute("id");
				 id = parseInt(id, 10);
				 if (btnCode === 2) {
				     if (game.data.tiles[id].isVisited === false && game.data.hasExploded === false && game.data.isTimeOver === false) {
					 game.controllers.flagNode(target, id);					
				     }
				 }
				 else {
				     if (game.data.tiles[id].eventAttached === true) {
					 game.controllers.clickToPlay(target, id);
				     } 
				 }
			     }
			     target = target.parentNode;
			 }

		    }, false);
		    
		    game.data.smiley.addEventListener("click", game.controllers.reset, false);
		},
		//mouse events do not have effect on node 
		removeMouseEvents: function(tilesIndex) {
		    game.data.tiles[tilesIndex].eventAttached = false;
		    return true;
		},
		plantBombs: function (id) {
		    var max = game.data.rowsIntoCols - 1, random;
		    
		    for (var currentBomb = 0; currentBomb < game.data.ms.bombs; currentBomb+=1) { 
			random = Math.floor(Math.random() * max);
			
			//1.if random no already exist into planted array
			//2.mines should not explode at 1st attempt
			if (game.data.tiles[random].value === -1 || id === random) {
			    currentBomb -= 1; //to regenerate no. at same index
			}
			else {
			    game.data.tiles[random].value = -1;
			}
		    }
		},
		timer: function(op) {

		    //1.update clock on game board
		    //2.stop the clock if "stop" is provided as argument
		    //3.stop game if time limit is exceeded i.e more than 999 seconds

		    var tick = 0;
		    if (op === "stop") {
			clearInterval(game.data.inter);
			return false;
		    }
		    game.data.inter = setInterval( function () {
			if (tick < 999) {
			    tick += 1;
			    game.data.clock.innerHTML = tick;
			}
			else {
			    clearInterval(game.data.inter);
			    game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.sad);
			    game.data.tiles.forEach(function (element, index) {
				game.controllers.removeMouseEvents(index);
			    });
			    game.data.isTimeOver = true;
			}
		    }, 1000);
		},
		calcValues: function () {
		    var upTd, downTd;
		    //calculating total 8 values around each mine
		    game.data.tiles.forEach(function (element, index, array) {
			
			if (element.value === -1) {
			  
			    //incrementing value of west node 
			    if (element.left !== undefined && array[index-1].value !== -1) {
				array[index-1].value += 1;
			    }

			    //incrementing value of east node
			    if (element.right !== undefined && array[index+1].value !== -1) {
				array[index+1].value += 1;
			    }
			   
			    if (element.up !== undefined) {	
				//incrementing value of north node
				upTd = index - game.data.ms.cols;
				
				if (array[upTd].value !== -1)  {
				    array[upTd].value += 1; 
				}    
				//incrementing value of north-west node
				if (element.left !== undefined && array[upTd - 1].value !== -1) {
				    array[upTd - 1].value += 1;
				}
				//incrementing value of north-east node
				if (element.right !== undefined && array[upTd + 1].value !== -1) {
				    array[upTd + 1].value += 1;
				}
			    }

			    if (element.down !== undefined) {
				
				//incrementing value of south node
				downTd = index + game.data.ms.cols;
				
				if (array[downTd].value !== -1) {
				    array[downTd].value += 1;
				}
				//incrementing value of south-west node
				if (element.left !== undefined && array[downTd - 1].value !== -1) {
				    array[downTd - 1].value += 1;
				}    
				//incrementing value of south-east node
				if (element.right !== undefined && array[downTd + 1].value !== -1) {
				    array[downTd + 1].value += 1;					
				}
				
			    }
			}
		    });
		},
		explodeMines: function (id) {
		    //check if clicked node is mine
		    var mine,node;
		    node = game.data.tiles[id];

		    if (node.value === -1 && node.isFlag === false) {
			game.ui.clickedMine(node.cell);
			game.data.hasExploded = true;

			//display each & every mine
			game.data.tiles.forEach(function (element, index, array) {
			    if (element.value === -1 && element.isFlag === false) {
				mine = element.cell;
				game.ui.exploreNode(mine);
				game.ui.setNodeImage(mine, game.data.ms.path + game.data.ms.images.explosion);
				game.controllers.removeMouseEvents(index);
			    }
			    else {
				game.controllers.traverse(index, element.cell);
			    }

			});

			//stop timer and display sad smiley
			game.controllers.timer("stop");
			game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.sad);
			return true;
		    }
		    return false;
		},
		traverse: function (k, thisNode) {
		    var id;
		    
		    //already visited this node 
		    if (game.data.tiles[k].isVisited === true || game.data.tiles[k].value === -1 ) {
			return false;
		    }
		    
		    //explore wrongly flagged nodes after mines explode
		    if (game.data.tiles[k].isFlag === true) {
			if (game.data.hasExploded === true) {
			    game.ui.exploreNode(thisNode);
			    game.ui.setNodeImage(thisNode, game.data.ms.path + game.data.ms.images.crossbomb);
			}
			return false;
		    }
		    
		    game.data.tiles[k].isVisited = true;
		    nodeValue = game.data.tiles[k].value;

		    //remove mouse events because node is visited
		    game.controllers.removeMouseEvents(k);

		    if(nodeValue === 0) {
			
			//for blank nodes
			game.ui.exploreNode(thisNode, nodeValue);
			//visit west node of current node 
			if (game.data.tiles[k].left !== undefined) {
			    game.controllers.traverse(k-1, game.data.tiles[k].left);
			}
			//visit east node of current node
			if (game.data.tiles[k].right !== undefined) {
			    game.controllers.traverse(k+1, game.data.tiles[k].right);
			}
			//visit north node of current node
			if (game.data.tiles[k].up !== undefined) {
			    id = k - game.data.ms.cols;
			    game.controllers.traverse(id, game.data.tiles[k].up);

			    //visit north-west node of current node
			    if (game.data.tiles[k].left !== undefined) {
				id = (k - game.data.ms.cols) - 1;
				game.controllers.traverse(id, game.data.tiles[id].cell);
			    }
			    //visit north-east node of current node
			    if (game.data.tiles[k].right !== undefined) {
				id = (k - game.data.ms.cols) + 1;
				game.controllers.traverse(id, game.data.tiles[id].cell);
			    }
			}
			//visit south node of current node
			if (game.data.tiles[k].down !== undefined) {
			    id = k + game.data.ms.cols;
			    game.controllers.traverse(id, game.data.tiles[k].down);

			    //visit south-west node of current node
			    if (game.data.tiles[k].left !== undefined) {
				id = (k + game.data.ms.cols)-1;
				game.controllers.traverse(id, game.data.tiles[id].cell);
			    }
			    //visit south-east node of current node
			    if (game.data.tiles[k].right !== undefined) {
				id = (k + game.data.ms.cols) + 1;
				game.controllers.traverse(id, game.data.tiles[id].cell);
			    }
			}
		    } 
		    else {
			//current node is numbered tile 
			game.ui.exploreNode(thisNode, nodeValue);
		    }
		    
		    return true;
		},
		win: function () {
		
		    var count = 0, node;
		    
		    game.data.tiles.forEach(function (element, index, array) {
			if (element.isVisited === false) {
			    count += 1;
			}
		    });

		    //player wins the game if total number of visited node 
		    //are equal to total number of nodes minus total no of mines
		    if (count === game.data.ms.bombs) {
			
			game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.king);
			
			game.data.tiles.forEach(function (element, index) {
			    if (element.value === -1) {
				node = element.cell;
				game.ui.setNodeImage(node, game.data.ms.path + game.data.ms.images.flag);
				element.isVisited = true;
			    }
			    game.controllers.removeMouseEvents(index);
			});
	
			game.controllers.timer("stop");
			return true;
		    }
		}//end of win

	    }
	};

	return {
	    initUI: function(ms) {
		game.data.ms = ms;
		game.ui.generateTable();
		game.data.table.innerHTML = game.data.template;
		game.data.bomb.innerHTML = game.data.ms.bombs;
		game.data.clock.innerHTML = "0";
		game.data.smiley.setAttribute("src", game.data.ms.path + game.data.ms.images.smiling);
		game.data.isInitialized = false;
		game.data.hasExploded = false;
		game.data.isTimeOver = false;
		game.data.tiles = [];
		game.data.bombs = game.data.ms.bombs;
		game.data.rowsIntoCols = game.data.ms.rows * game.data.ms.cols;
		game.controllers.addToTiles();		
	    },
	    initEvents: function() {
		game.controllers.initMouseEvents();
	    },
	    resetTimer: function() {
		clearInterval(game.data.inter);
	    }
	};
	
    }
    
}());