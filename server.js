const Websocket = require('ws');
const { CreatePlayerObject } = require('./player');
const m_port = 5000;
const wss = new Websocket.Server({ port: m_port });

var m_playerMap = new Map();
var m_changedPlayerArray = [];
var m_startAreaBounds = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
const UPDATE_INTERVAL_TIME = 50;
let intervalTime = 0;
let m_id = 0;

console.log("Server has started on port "+m_port);

wss.on('connection', ws => {
    console.log(`Client connected!`);
    var id = m_id;
    ++m_id;
    HandleMessage_initial(ws, id);

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
    });

    let interval = setInterval(() => SendChangedDataToClient(ws), UPDATE_INTERVAL_TIME);
    SendChangedDataToClient(ws);
});

const SendChangedDataToClient = async (ws) => {
    m_playerMap.forEach(playerInPlayerMap => {
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

    m_playerMap.forEach(playerInPlayerMap => {
        SendMessageToClient(ws, "world_data", `NewPlayer,${playerInPlayerMap.GetAllData()}`);
    });

    var newPlayer = CreatePlayerObject(id, `Player_${id}`, m_startAreaBounds);
    m_playerMap.set(`${id}`, newPlayer);
    console.log(`Sending: Player,${ newPlayer.GetAllData() }`);
    SendMessageToClient(ws, "player_data", `Player,${newPlayer.GetAllData()}`);

    SendMessageToAllClients(ws, "world_data", `NewPlayer,${newPlayer.GetAllData()}`);
}

const HandleMessage_update = (data) => {
    console.log(`data: ${data}`);
    m_playerMap.get(data[1]).Update(data);
}

async function ServerUpdate() {
    let d = new Date();
    let time = d.getTime();
    if (m_playerMap.length > 0) {
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

let update_interval = setInterval(() => ServerUpdate(), UPDATE_INTERVAL_TIME);
ServerUpdate();