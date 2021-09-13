
$(document).ready(function () {
	
    // DEFAULT - player is not in game
    $("#rps-headerIDLE").css("display", "show");
    $("#rps-headerGAME").css("display", "none");

    $("#rps-start").css("display", "none");
    $("#rps-actual").css("display", "none");
    $("#rps-idle").css("display", "show");

    // // STARTING A GAME - player has matched w an opponent
    // $("#rps-headerIDLE").css("display", "none");
    // $("#rps-headerGAME").css("display", "show");

    // $("#rps-start").css("display", "show");
    // $("#rps-actual").css("display", "none");
    // $("#rps-idle").css("display", "none");
	
    // TODO - place timer code here for 3 seconds
        // after timer is up hide divs and show the ff:
        // CHOOSING A MOVE
        // $("#rps-start").css("display", "none");
        // $("#rps-actual").css("display", "show");
        // $("#rps-idle").css("display", "none");

        // $("#rps-upper-result").removeClass("d-flex");
        // $("#rps-upper-result").css("display", "none");

        // $("#rps-lower-result").removeClass("d-flex");
        // $("#rps-lower-result").css("display", "none");

        // // when u click on a move the border turns GREEN
         $(".move-option").click(function () {
             $(this).addClass("border-success");
            
             // u cant change the move afterwards, so i just made the whole div unclickable LMAO
             $("#rps-lower-picking").css("pointer-events", "none");

        //     // so that its easier to find the move, i added "chosen-move" as a class
             $(this).addClass("chosen-move");
         });

    // // // RESULTS SCREEN
    // $("#rps-upper-waiting").removeClass("d-flex");
    // $("#rps-upper-waiting").css("display", "none");

    // $("#rps-lower-picking").removeClass("d-flex");
    // $("#rps-lower-picking").css("display", "none");

    // we'll place the input first before showing the divs

        // here we check the results so that will be if statements + result to show

        /*  FLOW

            - check move of player through .chosen_move
            - GET opponent's move
            - compare player's move with opponent's move
            - show result

        */

    // // show divs for results
    // $("#rps-upper-result").addClass("d-flex");
    // $("#rps-upper-result").css("display", "show");

    // $("#rps-lower-result").addClass("d-flex");
    // $("#rps-lower-result").css("display", "show");    
	
	//Var for game
	let roomId = "";
	let playerOneConnected = false;
	let playerTwoIsConnected = false;
	let playerId = 0;
	let my_choice = "nothing"
	let enemyChoice = "";
	let match_ongoing = false;
	
	//HTML ELEMENTS
	const socket = io();
	const idleHeader = document.getElementById("rps-headerIDLE");
	const battleHeader = document.getElementById("rps-headerGAME");
	const createRoomBtn = document.getElementById("create-room-btn");
	const joinRoomBtn = document.getElementById("join-room-btn");
	const actualRPS = document.getElementById("rps-actual");
	const rock = document.getElementById("player-rock");
	const paper = document.getElementById("player-paper");
	const scissors = document.getElementById("player-scissor");
	const lowerPicking = document.getElementById("rps-lower-picking");
	const lowerResult = document.getElementById("rps-lower-result");
	
	createRoomBtn.addEventListener("click", function(){
		let id = "sample_lang";

		socket.emit("create-room", id);
		console.log("player has created a fight")
		console.log("player has connected");
	})

	joinRoomBtn.addEventListener("click", function(){
		let id = "sample_lang";

		socket.emit("join-room", id);
		console.log("player has connected");
	})
	
	rock.addEventListener("click", function(){
		if(match_ongoing){
			console.log(playerId + " chose rock");
			
			my_choice = "rock";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	paper.addEventListener("click", function(){
		if(match_ongoing){
			console.log(playerId + " chose paper");
			
			my_choice = "paper";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	scissors.addEventListener("click", function(){
		if(match_ongoing){
			console.log("player " + playerId + " chose scissors");
			
			my_choice = "scissor";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	/*
	socket.on("room-created", id => {
		playerId = 1;
		roomId = id;
	})

	socket.on("room-joined", id => {
		console.log("room-joined was emitted")
		playerId = 2;
		console.log(playerId);
		roomId = id;
	})
	*/
	socket.on("plz_join", (data) => {
		roomID = data.roomID
		playerId = data.pID
		socket.emit('joining', data.roomID)
	})
	
	socket.on("all_players_connected", () => {
		
		//change header title
		idleHeader.style.display="none"
		battleHeader.style.display="block"
		
		$("#rps-start").css("display", "none");
		
        actualRPS.style.display = "block"
		
        $("#rps-idle").css("display", "none");

        $("#rps-upper-result").removeClass("d-flex");
        $("#rps-upper-result").css("display", "none");

        $("#rps-lower-result").removeClass("d-flex");
        $("#rps-lower-result").css("display", "none");
		match_ongoing = true;
		
		/*
			At this point players can choose
			to-do: implement timer here
		
		*/
	});
	socket.on("show-results", ({playerOneChoice, playerTwoChoice, win_code}) =>{
		
		/*
			
			Repeat if draw
			end if either wins
		
		*/
		//showing/hiding divs
		$("#rps-upper-waiting").removeClass("d-flex");
		$("#rps-upper-waiting").css("display", "none");

		$("#rps-lower-picking").removeClass("d-flex");
		$("#rps-lower-picking").css("display", "none"); 
		
		$("#rps-upper-result").addClass("d-flex");
		$("#rps-upper-result").css("display", "show");
		
		$("#rps-lower-result").addClass("d-flex");
		$("#rps-lower-result").css("display", "show"); 

		//result code
		
		if (win_code == 0){
			console.log("Both players chose " + playerOneChoice)
			console.log("Its a draw")
			$("#player-move").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			$("#opponent-choice").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			
			$("#rps-headerGAME").text("ITS A DRAW");
			$("#player-result").text("The fight goes on in 3 seconds...");
		}
		else if(playerId == 1){
			console.log("You chose " + playerOneChoice)
			console.log("They chose " + playerTwoChoice)
			$("#player-move").attr("src", "/img/rps-"+ playerOneChoice +".png");
			$("#opponent-choice").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			if(win_code ==1){
				$("#rps-headerGAME").text("YOU WIN");
				$("#opponent-choice").addClass("border-danger");
				$("#player-move").addClass("border-success");
				
				$("#player-result").text("Continuing with in 3 seconds...");
			}
				
			else{
				$("#rps-headerGAME").text("YOU LOSE");
				$("#opponent-choice").addClass("border-success");
				$("#player-move").addClass("border-danger");
				
				$("#player-result").text("Accepting defeat with in 3 seconds...");
			}
				
		}
		else if(playerId == 2){
			console.log("You chose " + playerTwoChoice)
			console.log("They chose " + playerOneChoice)
			$("#player-move").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			$("#opponent-choice").attr("src", "/img/rps-"+ playerOneChoice +".png");
			if(win_code ==2){
				$("#rps-headerGAME").text("YOU WIN");
				$("#opponent-choice").addClass("border-danger");
				$("#player-move").addClass("border-success");
				
				$("#player-result").text("Continuing with in 3 seconds...");
			}
				
			else{
				$("#rps-headerGAME").text("YOU LOSE");
				$("#opponent-choice").addClass("border-success");
				$("#player-move").addClass("border-danger");
				
				$("#player-result").text("Accepting defeat with in 3 seconds...");
			}
		}
		
		//Wait 3 seconds here
		
	})
	
	
	//functions
	
	function reset(){
		$("#opponent-choice").removeClass("border-danger");
		$("#player-move").removeClass("border-success");
		
		$("#opponent-choice").removeClass("border-success");
		$("#player-move").removeClass("border-danger");
		
		$("#rps-headerGAME").text("Battling");
		
		
	}

});
