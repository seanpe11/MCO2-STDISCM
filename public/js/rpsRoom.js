const rooms = {};

const createRoom = (roomId) => {
    rooms[roomId] = ["", ""];
}

const joinRoom = (roomId, playerID, pos) => {
    rooms[roomId][pos-1] = playerID;
}

const exitRoom = (roomId, player) => {
    if(player === 1){
        delete rooms[roomId];
    }else{
        rooms[roomId][1] = "";
    }
}

module.exports = {rooms, createRoom, joinRoom, exitRoom};