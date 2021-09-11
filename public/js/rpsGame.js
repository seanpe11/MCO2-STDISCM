
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
	let playerId = "";
	let match_ongoing = false;
	let my_choice = "";
	
	//HTML ELEMENTS
	const socket = io();
	const createRoomBtn = document.getElementById("create-room-btn");
	const joinRoomBtn = document.getElementById("join-room-btn");
	const actualRPS = document.getElementById("rps-actual");
	const rock = document.getElementById("player-rock");
	const paper = document.getElementById("player-paper");
	const scissors = document.getElementById("player-scissors");
	
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
			
			const my_choice = "rock";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	paper.addEventListener("click", function(){
		if(match_ongoing){
			console.log(playerId + " chose paper");
			
			const my_choice = "paper";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	scissors.addEventListener("click", function(){
		if(match_ongoing){
			console.log("player " + playerId + " chose scissors");
			
			const my_choice = "scissor";
			socket.emit("make-move", {playerId, my_choice, roomId});
		}
	})
	
	socket.on("room-created", id => {
		playerId = 1;
		roomId = id;

	})

	socket.on("room-joined", id => {
		playerId = 2;
		roomId = id;

	})
	
	socket.on("all_players_connected", () => {
		
		
		$("#rps-start").css("display", "none");
         actualRPS.style.display = "block"
         $("#rps-idle").css("display", "none");

         $("#rps-upper-result").removeClass("d-flex");
         $("#rps-upper-result").css("display", "none");

         $("#rps-lower-result").removeClass("d-flex");
         $("#rps-lower-result").css("display", "none");
		 match_ongoing = true;
	});
});
