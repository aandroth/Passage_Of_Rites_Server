

function CreatePlayerObject(id, name, startAreaBounds) {
    var newPlayerObject = {};
    newPlayerObject.m_id = id;
    newPlayerObject.m_name = name;
    newPlayerObject.m_startAreaBounds = startAreaBounds;
    newPlayerObject.m_color = { r: Math.random(), g: Math.random(), b: Math.random() };
    newPlayerObject.m_position = { x: (startAreaBounds.xMin + startAreaBounds.xMax) * 0.5, y: (startAreaBounds.yMin + startAreaBounds.yMax) * 0.5 };
    newPlayerObject.m_localScaleX = 1;
    newPlayerObject.m_state = 0; // 0: idle, 1: moving

    newPlayerObject.m_changedData = {
        positionX: "",
        positionY: "",
        localScaleX: "",
        state: ""
    }

    //Ensure that the position is within the bounds of the canvas

    newPlayerObject.Update = function (data) {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state
        //      0,  1,          2,          3,                           4,     5
        if (data[2] != "") {
            this.m_position.x = parseFloat(data[2]);
            this.m_changedData.positionX = data[2];
        }
        if (data[3] != "") {
            this.m_position.y = parseFloat(data[3]);
            this.m_changedData.positionY = data[3];
        }
        if (data[4] != "") {
            this.m_localScaleX = parseInt(data[4]);
            this.m_changedData.localScaleX = data[4];
        }
        if (data[5] != "") {
            this.m_state = parseInt(data[5]);
            this.m_changedData.state = data[5];
        }

        //if (newPlayerObject.m_position.x - newPlayerObject.m_size < newPlayerObject.m_startAreaBounds.xMin) { newPlayerObject.m_position.x = newPlayerObject.m_startAreaBounds.xMin + newPlayerObject.m_size + 1; }
        //else if (newPlayerObject.m_position.x + newPlayerObject.m_size + 50 > newPlayerObject.m_startAreaBounds.xMax) { newPlayerObject.m_position.x = newPlayerObject.m_startAreaBounds.xMax - 50 - newPlayerObject.m_size - 1; }
        //if (newPlayerObject.m_position.y - newPlayerObject.m_size < newPlayerObject.m_startAreaBounds.yMin) { newPlayerObject.m_position.y = newPlayerObject.m_startAreaBounds.yMin + newPlayerObject.m_size + 1; }
        //else if (newPlayerObject.m_position.y + newPlayerObject.m_size + 50 > newPlayerObject.m_startAreaBounds.yMax) { newPlayerObject.m_position.y = newPlayerObject.m_startAreaBounds.yMax - 50 - newPlayerObject.m_size - 1; }
    }

    newPlayerObject.GetChangedData = function () {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state";
        //      0,  1,          2,          3,                           4,     5
        var changedData = `${this.m_id},`;
        changedData += `${this.m_changedData.positionX},`;
        changedData += `${this.m_changedData.positionY},`;
        changedData += `${this.m_changedData.localScaleX},`;
        changedData += `${this.m_changedData.state}`;


        newPlayerObject.m_changedData = {
            positionX: "",
            positionY: "",
            localScaleX: "",
            state: ""
        }
        if (changedData == `${this.m_id},,,,`)
            changedData = "Unchanged";

        return changedData;
    }

    newPlayerObject.GetAllData = function () {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state, name, color";
        //      0,  1,          2,          3,                           4,     5,    6      7
        var allData = `${this.m_id},`;
        allData += `${this.m_position.x},`;
        allData += `${this.m_position.y},`;
        allData += `${this.m_localScaleX},`;
        allData += `${this.m_state},`;
        allData += `${this.m_name},`;
        allData += `${this.m_color.r}|${this.m_color.g}|${this.m_color.b}`;

        return allData;
    }

    return newPlayerObject;
}

module.exports.CreatePlayerObject = CreatePlayerObject;