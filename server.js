const Websocket = require('ws');
const { CreatePlayerObject } = require('./player');
const { GetPlayerPositionAndFacing } = require('./player_starting_positions');
const m_port = 5000;
const wss = new Websocket.Server({ port: m_port });
const args = require('minimist')(process.argv.slice(2));
const SERVER_NAME = args['serverName'];

var m_playerUnchangingDataDictionary = new Map();
var m_playerDictionary = new Map();
var m_playerReadinessDictionary = new Map();
var m_changedPlayerArray = [];
var m_playingGame = false;
var m_startAreaBounds = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
let m_noPlayerCountUp = 0;
let intervalTime = 0;
let m_idInUse = [false, false, false, false];
let m_intervalUpdateId = 0;
const UPDATE_INTERVAL_TIME = 20;
const NO_PLAYER_TIME_OUT = 60;
const NUMBER_OF_PLAYER_SLOTS = 4;

const RAT_CATCHING_GAME_TIME = 120.0;
const TRAP_MAKING_GAME_TIME = 120.0;
const HALLWAY_GAME_TIME = 120.0;
const GOLEM_GAME_TIME = 120.0;

let m_CurrGameTimeCountdown = 0.0;
let m_CurrGameTime = Date.now();

const SERVER_STATE = Object.freeze({
    NOT_PLAYING: Symbol("not_playing"),
    LEVEL_LOADING: Symbol("level_loading"),
    CHAR_CREATION: Symbol("char_creation"),
    GAME_INTRO: Symbol("game_intro"),
    GAME_READY: Symbol("game_ready"),
    GAME_PLAYING: Symbol("game_playing"),
    GAME_ENDED: Symbol("game_ended"),
    GAME_OUTRO: Symbol("game_outro")
});
const GAME_STATE = Object.freeze({
    NOT_PLAYING: Symbol("not_playing"),
    RAT_CATCHING_GAME: Symbol("rat_catching_game"),
    TRAP_MAKING_GAME: Symbol("trap_making_game"),
    HALLWAY_GAME: Symbol("hallway_game"),
    GOLEM_GAME: Symbol("golem_game")
});
let m_serverState = SERVER_STATE.NOT_PLAYING;
let m_gameState = GAME_STATE.NOT_PLAYING;
let m_serverOwnerId = -1;

//console.log("Server " + SERVER_NAME + " has started on port " + m_port);

//m_playerUnchangingDataDictionary.set(4, { name: `Kobold_${4}`, color: { r: Math.random(), g: Math.random(), b: Math.random() } });
//console.log("NAME: " + m_playerUnchangingDataDictionary.get(4).name);

//m_playerUnchangingDataDictionary.get(4).name = "Bob";
//console.log("NAME: " + m_playerUnchangingDataDictionary.get(4).name);

//console.log("NAME: " + m_playerUnchangingDataDictionary.get(4).color.r);
//console.log("NAME: "+m_playerUnchangingDataDictionary.get(4).color.g);
//console.log("NAME: "+m_playerUnchangingDataDictionary.get(4).color.b);

wss.on('connection', ws => {
    console.log(`Client connected!`);
    var id = GetNextId();

    HandleMessage_initial(ws, id);
    if (id != -1) {
        m_playerDictionary.set(id, {});
        m_playerUnchangingDataDictionary.set(id, { name: `Kobold_${id}`, titles: "", color: { r: Math.random(), g: Math.random(), b: Math.random() } });
        console.log("NAME: " + m_playerUnchangingDataDictionary.get(id).name);
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
            if (listedData.length == 3 && listedData[0] == "Change_Name") {
                HandleMessage_nameChange(listedData);
            }
            if (listedData.length == 2 && listedData[0] == "Player_Ready") {
                HandleMessage_playerReady(id);
            }
            if (listedData.length == 2 && listedData[0] == "Load_Level") {
                HandleMessage_loadLevel(listedData);
            }
            if (listedData.length == 2 && listedData[0] == "Create_Chars") {
                HandleMessage_createChars(listedData);
            }
            if (listedData.length == 1 && listedData[0] == "Game_Start") {
                HandleMessage_gameStart(listedData);
            }
            if (listedData.length == 2 && listedData[0] == "Start_Countdown") {
                HandleMessage_startCountdown(listedData);
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
        if (m_playerDictionary.size == 0) {
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
function SendMessageToAllClients(messageAction = "", messageData = {}) {
    if (messageAction == "") {
        console.log(`Message to Client must have a type!`);
        return;
    }
    var messageToClient = JSON.stringify(messageData);
    console.log(`SendMessageToAllClients: ${messageToClient}`);
    wss.clients.forEach(client => client.send(messageToClient));
}

const HandleMessage_initial = (ws, id) => {

    console.log(`Sending: Init,${ id }`);
    SendMessageToClient(ws, "player_init", `Init,${id}`);
}

const HandleMessage_makePlayerOwner = (ws, id) => {

    console.log(`Sending: player_owner,${ id }`);
    SendMessageToClient(ws, "player_owner", `Make_Owner,${id},t`);
}

const HandleMessage_createPlayer = (ws, id) => {
    SendMessageToAllClients("world_data", `New_Player,${newPlayer.GetAllData()}`);
}


const CreateAllCharsForAllPlayers = () => {

    Object.keys(m_idInUse).forEach((id) => {
        console.log(`Checking if ${id} is in use`);
        if (m_idInUse[id]) {
            let intId = parseInt(id);
            console.log(`Creating char for player ${intId}`);
            if (!m_playerUnchangingDataDictionary.get(intId).name || m_playerUnchangingDataDictionary.get(intId).name.length == 0)
                m_playerUnchangingDataDictionary.get(intId).name = `Kobold_${id}`;
            console.log(`NAME: ${m_playerUnchangingDataDictionary.get(intId).name}`);
            var newPlayer = CreatePlayerObject(id, m_playerUnchangingDataDictionary.get(intId).name, m_playerUnchangingDataDictionary.get(intId).color);
            m_playerDictionary[id] = newPlayer;    
            console.log(`Sending for player ${id}: New_Player,${newPlayer.GetAllData()}`);
            SendMessageToAllClients("New_Player", `New_Player,${newPlayer.GetAllData()}`);
        }
    });
}

const GameReadyForAllPlayers = () => {

    console.log(`GameReadyForAllPlayers`);
    Object.keys(m_idInUse).forEach((id) => {
        console.log(`Checking if ${id} is in use`);
        if (m_idInUse[id])
            SendMessageToAllClients("Game_Ready", `Game_Ready,${id}`);
    });
}

const StartGameCountdown = () => {

    if (m_gameState == GAME_STATE.RAT_CATCHING_GAME)
        m_CurrGameTimeCountdown = RAT_CATCHING_GAME_TIME;

    if (m_gameState == GAME_STATE.TRAP_MAKING_GAME)
        m_CurrGameTimeCountdown = TRAP_MAKING_GAME_TIME;

    if (m_gameState == GAME_STATE.HALLWAY_GAME)
        m_CurrGameTimeCountdown = HALLWAY_GAME_TIME;

    if (m_gameState == GAME_STATE.GOLEM_GAME)
        m_CurrGameTimeCountdown = GOLEM_GAME_TIME;
}

const HandleMessage_update = (data) => {
    console.log(`data: ${data}`);
    m_playerDictionary.get(data[1]).Update(data);
}

const HandleMessage_nameChange = (data) => {
    console.log(`data: ${data[1]}`);
    console.log(`data: ${data[2]}`);
    m_playerUnchangingDataDictionary.get(parseInt(data[1])).name = data[2];
    console.log("NAME: " + m_playerUnchangingDataDictionary.get(parseInt(data[1])).name);
}

const HandleMessage_playerReady = (id) => {
    console.log(`Player ${id} is ready.`);
    if (m_serverState == SERVER_STATE.LEVEL_LOADING) console.log(`Player is ready while m_serverState is LEVEL_LOADING`);
    if (m_serverState == SERVER_STATE.CHAR_CREATION) console.log(`Player is ready while m_serverState is CHAR_CREATION`);
    m_playerReadinessDictionary.set(id, true);
    console.log(`m_playerReadinessDictionary size: ${m_playerReadinessDictionary.size}`);
    console.log(`m_playerDictionary size: ${m_playerDictionary.size}`);
    if (m_playerReadinessDictionary.size == m_playerDictionary.size) {
        m_playerReadinessDictionary = new Map();
        if (m_serverState == SERVER_STATE.LEVEL_LOADING) {
            CreateAllCharsForAllPlayers();
            m_serverState = SERVER_STATE.CHAR_CREATION;
        }
        else if (m_serverState == SERVER_STATE.CHAR_CREATION) {
            m_serverState = SERVER_STATE.GAME_INTRO;
            SendMessageToAllClients("Start_Intro", `Start_Intro,`);
        }
        else if (m_serverState == SERVER_STATE.GAME_INTRO) {
            //StartGameCountdown();
            m_serverState = SERVER_STATE.GAME_READY;
            SendMessageToAllClients("Call_Countdown", `Call_Countdown,`);
        }
        else if (m_serverState == SERVER_STATE.GAME_PLAYING) {
            m_serverState = SERVER_STATE.GAME_OUTRO;
            SendMessageToAllClients("Start_Outro", `Start_Outro,`);
        }
        else if (m_serverState == SERVER_STATE.GAME_OUTRO) {
            m_serverState = SERVER_STATE.LEVEL_LOADING;
            SendMessageToAllClients("Ready_For_Next_Level", `Ready_For_Next_Level,`);
        }
    }
}

const HandleMessage_startCountdown = (data) => {
    console.log(`data: ${data}`);
    m_CurrGameTimeCountdown = (parseFloat(data[1]) + 1.0) * 1000; // Multiply by 1000 to convert to milliseconds
    m_CurrGameTime = Date.now();
    console.log(`Starting countdown with : ${m_CurrGameTimeCountdown}`);
    SendMessageToAllClients("Start_Countdown", `${data}`);
    m_serverState = SERVER_STATE.GAME_PLAYING;
}

const HandleMessage_loadLevel = (data) => {
    console.log(`data: ${data}`);
    // Load the level
    SendMessageToAllClients("load_level", `${data}`);
    m_serverState = SERVER_STATE.LEVEL_LOADING;
    if (data == "1")
        m_gameState = GAME_STATE.RAT_CATCHING_GAME;
    else if (data == "2")
        m_gameState = GAME_STATE.TRAP_MAKING_GAME;
    else if (data == "3")
        m_gameState = GAME_STATE.HALLWAY_GAME;
    else if (data == "4")
        m_gameState = GAME_STATE. GOLEM_GAME;
}

const HandleMessage_createChars = (data) => {
    console.log(`data: ${data}`);

    m_serverState = SERVER_STATE.CHAR_CREATION;
    for (let i = 0; i < NUMBER_OF_PLAYER_SLOTS; ++i) {
        if (m_idInUse[i])
            HandleMessage_createPlayer(i);
    }
}

const HandleMessage_gameStart = (data) => {
    // Tell all players to start the game
    SendMessageToAllClients("start_game", `Game_Start,${data}`);
}

function GetNextId(){
    for (let i = 0; i < NUMBER_OF_PLAYER_SLOTS; i++) {
        if (!m_idInUse[i])
            return i;
    }
    return -1; // Server Full
}


async function ServerUpdate() {
    
    if (m_serverState == SERVER_STATE.GAME_PLAYING && m_CurrGameTimeCountdown > 0) {
        let deltaTime = Date.now() - m_CurrGameTime;
        m_CurrGameTime = Date.now();
        if (m_playerDictionary.length > 0) {
            if (m_playingGame)
                m_playerArray.forEach(playerInPlayerArray => playerInPlayerArray.Update());
        }
        console.log("Before: " + m_CurrGameTimeCountdown);
        m_CurrGameTimeCountdown -= (deltaTime);
        console.log("After: "+m_CurrGameTimeCountdown);

        if (m_CurrGameTimeCountdown <= 0) {
            if (!m_serverState == SERVER_STATE.GAME_OUTRO) {
                SendMessageToAllClients("Stop_Game", `Stop_Game,`);
            }
        }
    }

    if (m_playerDictionary.length == 0) {
        m_noPlayerCountUp += deltaTime;
        if (m_noPlayerCountUp >= NO_PLAYER_TIME_OUT) {
            clearInterval();
        }
    }
}

///////////////////////////////////////////////////////////////////////

m_intervalUpdateId = setInterval(() => ServerUpdate(), UPDATE_INTERVAL_TIME);
ServerUpdate();