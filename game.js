class Player{
    constructor(name, index){
        this.name = name
        this.index = index
        this.x = 0
        this.y = 0
        this.isFighting = false
        this.isAlive = true
    }
}

function generateRoomCode(){

}

// simply adds, removes, and preserves state of players
class RPSBR {
    constructor(players, roomid){
        this.players = players
        this.map = 500// since its a square, literally just the length of a side
        this.roomid =  roomid
        this.active = false
    }

    start(){
        this.players.forEach((player) => {
            player.x = 0
            player.y = 0
        })
        this.active = true
    }
    
    eliminate(player){
        // set player as dead
        this.players[this.players.indexOf(player)].isAlive = false
    }

    add(name){
        // add player to array
        newPlayer = new Player(name, this.players.length)
        this.players.append(newPlayer)
    }

    findPlayer(name){
        return this.players.indexOf((obj) => {obj.name == name})
    }

    shrinkMap(){
        if (this.map > 200){
            this.map -= 10
            // just kill them if they're outside the boundary
            this.players.forEach((player) => {
                if(player.x > this.map || player.y > this.map){
                    player.isAlive = false
                }
            })
        }
    }
    
    updateTick(){
        this.players.forEach((player) => {
            if (  (x < leftLimit || 
                x > rightLimit ||
                y < topLimit ||
                y > bottomLimit ) && !isDead) {
                    isDead = true;
        // player_character.style.backgroundColor = "#ff0000";
        player_character.style.opacity = "0.5";
        headline.style.visibility = "visible";
      }
        })
        return {players: this.players, map: this.map}
    }
}

module.exports.RPSBR = RPSBR
module.exports.Player = Player
