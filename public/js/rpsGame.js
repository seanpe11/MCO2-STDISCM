
$(document).ready(function () {
	
    // DEFAULT - player is not in game
    $("#rps-headerIDLE").css("display", "show");
    $("#rps-headerGAME").css("display", "none");

    $("#rps-start").css("display", "none");
    $("#rps-actual").css("display", "none");
    $("#rps-idle").css("display", "show");

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

			rock.classList.add("border-success");
			$("#rps-lower-picking").css("pointer-events", "none");
			my_choice = "rock";

			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	paper.addEventListener("click", function(){
		if(match_ongoing){
			console.log(playerId + " chose paper");
			
			paper.classList.add("border-success");
			$("#rps-lower-picking").css("pointer-events", "none");
			my_choice = "paper";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	scissors.addEventListener("click", function(){
		if(match_ongoing){
			console.log("player " + playerId + " chose scissors");
			
			scissors.classList.add("border-success");
			$("#rps-lower-picking").css("pointer-events", "none");
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
		
		// show starting message
		$("#rps-start").css("display", "block");
        actualRPS.style.display = "none"
        $("#rps-idle").css("display", "none");

		// timer for 3 seconds before starting the game
		setTimeout(() => { 
			// show divs to start choosing move
			$("#rps-start").css("display", "none");
			actualRPS.style.display = "block"
			$("#rps-upper-result").removeClass("d-flex");
			$("#rps-upper-result").css("display", "none");

			$("#rps-lower-result").removeClass("d-flex");
			$("#rps-lower-result").css("display", "none");

			match_ongoing = true;	

		}, 3000);

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
		
		// Its a DRAW -> game resets to play again
		if (win_code == 0){
			console.log("Both players chose " + playerOneChoice)
			console.log("Its a draw")
			$("#player-move").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			$("#opponent-choice").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			
			$("#rps-headerGAME").text("ITS A DRAW");
			$("#player-result").text("The fight goes on in 3 seconds...");
			
			// timer for 3 seconds before showing options again
			setTimeout(() => {  
				reset();

			}, 3000);
		}
		// Both were idle -> both lose
		else if(win_code == 3) {
			console.log("Both players were " + playerOneChoice)
			console.log("So they both lose")
			$("#player-move").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			$("#opponent-choice").attr("src", "/img/rps-"+ playerTwoChoice +".png");
			
			$("#opponent-choice").addClass("border-danger");
			$("#player-move").addClass("border-danger");

			$("#rps-headerGAME").text("YOU BOTH LOSE");
			$("#player-result").text("Accepting defeat with in 3 seconds...");
			
			// timer for 3 seconds before ending the game
			setTimeout(() => { 
				end_reset();
			}, 3000);

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
			
			// timer for 3 seconds before ending the game
			setTimeout(() => { 
				end_reset();
			}, 3000);
				
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
			
			// timer for 3 seconds before ending the game
			setTimeout(() => { 
				end_reset();
			}, 3000);
		}
		
	})
	
	
	//functions
	
	// for draws
	function reset(){
		$("#opponent-choice").removeClass("border-danger");
		$("#player-move").removeClass("border-success");
		
		$("#opponent-choice").removeClass("border-success");
		$("#player-move").removeClass("border-danger");
		
		$("#rps-headerGAME").text("Battling");
		
		$("#rps-upper-result").removeClass("d-flex");
        $("#rps-upper-result").css("display", "none");
		
		$("#rps-lower-result").removeClass("d-flex");
        $("#rps-lower-result").css("display", "none");
		
		$("#rps-lower-picking").addClass("d-flex");
		$("#rps-lower-picking").css("display", "show"); 
		
		$("#rps-lower-picking").css("pointer-events", "auto");
		
		$("#rps-upper-waiting").addClass("d-flex");
		$("#rps-upper-waiting").css("display", "show");
		
		$("#player-rock").removeClass("border-success");
		$("#player-paper").removeClass("border-success");
		$("#player-scissor").removeClass("border-success");
		
		let my_choice = "nothing";

						// timer for 10 seconds for the player to choose a move
						setTimeout(() => { 
							// if the player didnt choose a move within 10 seconds, then they will lose the rps game
							if(my_choice=="nothing") {
								my_choice = "idle";
								socket.emit("make-move", {playerId, my_choice, roomId});
							}
						}, 10000);	
	}

	// after losing / winning
	function end_reset(){

		// resetting picking screen values
		$("#rps-headerGAME").text("Battling");
		$("#player-rock").removeClass("border-success");
		$("#player-paper").removeClass("border-success");
		$("#player-scissor").removeClass("border-success");

		$("#rps-upper-waiting").addClass("d-flex");
		$("#rps-upper-waiting").css("display", "show");

		$("#rps-lower-picking").addClass("d-flex");
		$("#rps-lower-picking").css("display", "show"); 
		$("#rps-lower-picking").css("pointer-events", "auto");

		// resetting end screen values
		$("#opponent-choice").removeClass("border-danger");
		$("#player-move").removeClass("border-success");
		$("#opponent-choice").removeClass("border-success");
		$("#player-move").removeClass("border-danger");

		// SET BACK TO DEFAULT - player is not in game
		$("#rps-headerIDLE").css("display", "block");
		$("#rps-headerGAME").css("display", "none");
	
		$("#rps-start").css("display", "none");
		$("#rps-actual").css("display", "none");
		$("#rps-idle").css("display", "block");
				
		// resetting variables in js file
		let roomId = "";
		let playerOneConnected = false;
		let playerTwoIsConnected = false;
		let playerId = 0;
		let my_choice = "nothing"
		let enemyChoice = "";
		let match_ongoing = false;
	}

});
