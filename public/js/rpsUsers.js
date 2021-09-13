const connectedUsers = {};
const choices = {};
const moves = {
    "rock": "scissor",
    "paper": "rock",
    "scissor": "paper",
    "idle": "idle"
};

const initializeChoices = (roomId) => {
    choices[roomId] = ["", ""]
    console.log(choices[roomId])
    /*
        Idea is that it initializes an empty array
        This would store moves sent by the client

    */
}

const userConnected = (userId) => {
    connectedUsers[userId] = true;
}

const makeMove = (roomId, player, choice) => {
    if(choices[roomId]){
        choices[roomId][player - 1] = choice;

        console.log(choices[roomId])
    }
}

module.exports = {connectedUsers, initializeChoices, userConnected, makeMove, moves, choices};