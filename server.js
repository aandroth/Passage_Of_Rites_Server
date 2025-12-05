const Websocket = require('ws');
const { CreatePlayerObject } = require('./player');
const m_port = 5000;
const wss = new Websocket.Server({ port: m_port });
const args = require('minimist')(process.argv.slice(2));
const SERVER_NAME = args['serverName'];

var m_playerDictionary = new Map();
var m_changedPlayerArray = [];
var m_playingGame = false;
var m_startAreaBounds = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
let m_noPlayerCountUp = 0;
let intervalTime = 0;
let m_idInUse = [false, false, false, false];
let m_intervalUpdateId = 0;
const UPDATE_INTERVAL_TIME = 20;
const NO_PLAYER_TIME_OUT = 6000;
const NUMBER_OF_PLAYER_SLOTS = 4;

const RAT_CATCHING_GAME_TIME = 120;
const TRAP_MAKING_GAME_TIME = 120;
const HALLWAY_GAME_TIME = 120;
const GOLEM_GAME_TIME = 120;

let m_ratCatchingGameTimeCountdown = 120.0;
let m_trapMakingGameTimeCountdown = 120.0;
let m_hallwayGameTimeCountdown = 120.0;
let m_GolemGameTimeCountdown = 120.0;

const ServerState = Object.freeze({
    NOT_PLAYING: Symbol("not_playing"),
    RAT_CATCHING_GAME: Symbol("rat_catching_game"),
    TRAP_MAKING_GAME: Symbol("trap_making_game"),
    HALLWAY_GAME: Symbol("hallway_game"),
    GOLEM_GAME: Symbol("golem_game"),
});
let m_serverState = ServerState.NOT_PLAYING;
let m_serverOwnerId = -1;

console.log("Server " + SERVER_NAME + " has started on port " + m_port);

wss.on('connection', ws => {
    console.log(`Client connected!`);
    var id = GetNextId();

    HandleMessage_initial(ws, id);
    if (id != -1) {
        m_playerDictionary.set(id, id);
        m_idInUse[id] = true;
        console.log("Player count: " + m_playerDictionary.size);
        m_noPlayerCountUp = 0;

        if (m_serverOwnerId == -1) {
            console.log("Updating m_serverOwnerId");
            m_serverOwnerId = id;
            HandleMessage_makePlayerOwner(ws, id);
        }

        ws.on("message", data => {
            console.log(`Client sent ${data}`);
            var stringData = `${data}`;
            var listedData = stringData.split(',');
            console.log(`Received Update: ${stringData}`);

            if (listedData.length == 6 && listedData[0] == "Update") {
                HandleMessage_update(listedData);
            }
            if (listedData.length == 2 && listedData[0] == "Name") {
                HandleMessage_name(listedData);
            }
        });

        ws.on("close", () => {
            console.log("Client disconnected!");
            m_playerDictionary.delete(id);
            m_idInUse[id] = false;
            if (m_serverOwnerId == id) {
                m_serverOwnerId = -1;
                for (let i = 0; i < NUMBER_OF_PLAYER_SLOTS; i++){
                    if (m_idInUse[i]) m_serverOwnerId = i;
                }
            }
            console.log("Player count: " + m_playerDictionary.size);
        });

        let interval = setInterval(() => SendChangedDataToClient(ws), UPDATE_INTERVAL_TIME);
        SendChangedDataToClient(ws);
    }
});

const SendChangedDataToClient = async (ws) => {
    if (m_playingGame) {
        if (m_playerDictionary.length == 0) {
            m_noPlayerCountUp += UPDATE_INTERVAL_TIME;
            if (m_noPlayerCountUp >= NO_PLAYER_TIME_OUT)
                clearInterval(m_intervalUpdateId);
        }

        m_playerDictionary.forEach(playerInPlayerMap => {
            var changedData = playerInPlayerMap.GetChangedData();
            if (changedData != "Unchanged") {
                console.log(`changedData: ${changedData}`);
                SendMessageToClient(ws, "update", `Update,${changedData}`);
            }
        });
    }
}

function SendMessageToClient(ws, messageAction = "", messageData = {}) {
    if (messageAction == "") {
        console.log(`Message to Client must have a type!`);
        return;
    }
    //console.log(`Sending action ${messageAction} with data ${JSON.stringify(messageData)}`);
    messageData.action = messageAction;
    var messageToClient = JSON.stringify(messageData);
    console.log(`SendMessageToClient: ${messageToClient}`);
    ws.send(messageToClient);
}
function SendMessageToAllClients(ws, messageAction = "", messageData = {}) {
    if (messageAction == "") {
        console.log(`Message to Client must have a type!`);
        return;
    }
    var messageToClient = JSON.stringify(messageData);
    console.log(`SendMessageToAllClients: ${messageToClient}`);
    wss.clients.forEach(client => client.send(messageToClient));
}

const HandleMessage_initial = (ws, id) => {

    console.log(`Sending: Player,${ id }`);
    SendMessageToClient(ws, "player_init", `Init,${id}`);
}

const HandleMessage_makePlayerOwner = (ws, id) => {

    console.log(`Sending: player_owner,${ id }`);
    SendMessageToClient(ws, "player_owner", `Make_Owner,${id},t`);
}

const HandleMessage_createPlayer = (ws, id) => {

    m_playerDictionary.forEach(playerInPlayerMap => {
        SendMessageToClient(ws, "world_data", `NewPlayer,${playerInPlayerMap.GetAllData()}`);
    });

    var newPlayer = CreatePlayerObject(id, `Kobold_${id}`, m_startAreaBounds);
    m_playerDictionary.set(`${id}`, newPlayer);
    console.log(`Sending: Player,${ newPlayer.GetAllData() }`);
    SendMessageToClient(ws, "player_data", `Player,${newPlayer.GetAllData()}`);

    SendMessageToAllClients(ws, "world_data", `NewPlayer,${newPlayer.GetAllData()}`);
}

const HandleMessage_update = (data) => {
    console.log(`data: ${data}`);
    m_playerDictionary.get(data[1]).Update(data);
}

function GetNextId(){
    for (let i = 0; i < NUMBER_OF_PLAYER_SLOTS; i++) {
        if (!m_idInUse[i])
            return i;
    }
    return -1; // Server Full
}

async function ServerUpdate() {
    let d = new Date();
    let time = d.getTime();
    if (m_playerDictionary.length > 0) {
        if (m_playingGame)
            m_playerArray.forEach(playerInPlayerArray => playerInPlayerArray.Update());
    }
    d = new Date();
    let deltaTime = d.getTime() - time;

    if (m_playerDictionary.length == 0) {
        m_noPlayerCountUp += deltaTime;
        if (m_noPlayerCountUp >= NO_PLAYER_TIME_OUT) {
            clearInterval();
        }
    }
    //console.log("Server Update end at " + d.getTime() + ", with delta of " + (deltaTime));
    let intervalTimeDelta = d.getTime() - intervalTime;
    intervalTime = d.getTime();
    //console.log("Server UpdateInterval lasted till " + intervalTime + ", with delta of " + intervalTimeDelta);
}

///////////////////////////////////////////////////////////////////////

m_intervalUpdateId = setInterval(() => ServerUpdate(), UPDATE_INTERVAL_TIME);
ServerUpdate();