

function CreateNpcObject(id, dataList) {
    //"Action, id, spawnerId, NpcType, position_X, position_Y, transform.localScale_X, state";
    //      0,  1,         2,       3,          4,          5,                      6,     7
    var newNpcObject = {};
    newNpcObject.m_status = "set";
    newNpcObject.m_id = id;
    newNpcObject.m_spawnerId = parseInt(dataList[2]);
    newNpcObject.m_npcType = parseInt(dataList[3]);
    newNpcObject.m_position = { x: parseFloat(dataList[4]), y: parseFloat(dataList[5]) };
    newNpcObject.m_localScaleX = parseInt(dataList[6]);
    newNpcObject.m_state = 0; // 0: idle, 1: moving, 2: destroyed

    newNpcObject.m_changedData = {
        positionX: "",
        positionY: "",
        localScaleX: "",
        state: "",
    }

    //Ensure that the position is within the bounds of the canvas

    newNpcObject.Update = function (data) {

        //"Action, id, spawnerId, NpcType, position_X, position_Y, transform.localScale_X, state";
        //      0,  1,         2,       3,          4,          5,                      6,     7
        if (data[4] != "") {
            this.m_position.x = parseFloat(data[4]);
            this.m_changedData.positionX = data[4];
        }
        if (data[5] != "") {
            this.m_position.y = parseFloat(data[5]);
            this.m_changedData.positionY = data[5];
        }
        if (data[6] != "") {
            this.m_localScaleX = parseInt(data[6]);
            this.m_changedData.localScaleX = data[6];
        }
        if (data[7] != "") {
            this.m_state = parseInt(data[7]);
            this.m_changedData.state = data[7];
        }
    }

    newNpcObject.GetChangedData = function () {
    //"Action, id, spawnerId, NpcType, position_X, position_Y, transform.localScale_X, state";
    //      0,  1,         2,       3,          4,          5,                      6,     7
        var changedData = `${this.m_id},,`;
        changedData += `${this.m_changedData.positionX},`;
        changedData += `${this.m_changedData.positionY},`;
        changedData += `${this.m_changedData.localScaleX},`;
        changedData += `${this.m_changedData.state}`;


        newNpcObject.m_changedData = {
            positionX: "",
            positionY: "",
            localScaleX: "",
            state: "",
        }
        if (changedData == `,${id},,,,,,`)
            changedData = "Unchanged";

        return changedData;
    }

    newNpcObject.GetAllData = function () {

        //"Action, id, spawnerId, NpcType, position_X, position_Y, transform.localScale_X, state";
        //      0,  1,         2,       3,          4,          5,                      6,     7


        var allData = `${this.m_id},`;
        allData += `${this.m_spawnerId},`;
        allData += `${this.m_npcType},`;
        allData += `${this.m_position.x},`;
        allData += `${this.m_position.y},`;
        allData += `${this.m_localScaleX},`;
        allData += `${this.m_state}`;

        return allData;
    }

    return newNpcObject;
}

module.exports.CreateNpcObject = CreateNpcObject;