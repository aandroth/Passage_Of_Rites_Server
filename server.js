const Websocket = require('ws');
const { CreatePlayerObject } = require('./player');
const m_port = 5000;
const wss = new Websocket.Server({ port: m_port });

var m_playerDictionary = new Map();
var m_changedPlayerArray = [];
var m_startAreaBounds = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
const UPDATE_INTERVAL_TIME = 50;
let NO_PLAYER_TIME_OUT = 6000;
let m_noPlayerCountUp = 0;
let intervalTime = 0;
let m_id = 0;
let m_intervalUpdateId = 0;

console.log("Server has started on port "+m_port);

wss.on('connection', ws => {
    console.log(`Client connected!`);
    var id = m_id;
    ++m_id;
    HandleMessage_initial(ws, id);
    m_playerDictionary[id] = id;
    console.log("Player count: " + m_playerDictionary.length);
    m_noPlayerCountUp = 0;

    ws.on("message", data => {
        console.log(`Client sent ${data}`);
        var stringData = `${data}`;
        var listedData = stringData.split(',');
        console.log(`Received Update: ${stringData}`);

        if (listedData.length == 6 && listedData[0] == "Update") {
            HandleMessage_update(listedData);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected!");
        m_playerDictionary.delete(id);
        console.log("Player count: " + m_playerDictionary.length);
    });

    let interval = setInterval(() => SendChangedDataToClient(ws), UPDATE_INTERVAL_TIME);
    SendChangedDataToClient(ws);
});

const SendChangedDataToClient = async (ws) => {

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

    m_playerDictionary.forEach(playerInPlayerMap => {
        SendMessageToClient(ws, "world_data", `NewPlayer,${playerInPlayerMap.GetAllData()}`);
    });

    var newPlayer = CreatePlayerObject(id, `Player_${id}`, m_startAreaBounds);
    m_playerDictionary.set(`${id}`, newPlayer);
    console.log(`Sending: Player,${ newPlayer.GetAllData() }`);
    SendMessageToClient(ws, "player_data", `Player,${newPlayer.GetAllData()}`);

    SendMessageToAllClients(ws, "world_data", `NewPlayer,${newPlayer.GetAllData()}`);
}

const HandleMessage_update = (data) => {
    console.log(`data: ${data}`);
    m_playerDictionary.get(data[1]).Update(data);
}

async function ServerUpdate() {
    let d = new Date();
    let time = d.getTime();
    if (m_playerDictionary.length > 0) {
        //m_playerArray.forEach(playerInPlayerArray => playerInPlayerArray.Update());
    }
    else {
        // Shut down
    }
    d = new Date();
    let deltaTime = d.getTime() - time;
    //console.log("Server Update end at " + d.getTime() + ", with delta of " + (deltaTime));
    let intervalTimeDelta = d.getTime() - intervalTime;
    intervalTime = d.getTime();
    //console.log("Server UpdateInterval lasted till " + intervalTime + ", with delta of " + intervalTimeDelta);
}

///////////////////////////////////////////////////////////////////////

m_intervalUpdateId = setInterval(() => ServerUpdate(), UPDATE_INTERVAL_TIME);
ServerUpdate();