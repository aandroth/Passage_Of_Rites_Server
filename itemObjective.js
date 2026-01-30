

function CreateItemObjective(id, dataList) {

    //"Action, id, ownerId, ItemType, OwnerType, position_X, position_Y, transform.localScale_X, state";
    //      0,  1,       2,        3,         4,          5,          6,                      7,     8

    var newItemObjectiveObject = {};
    newItemObjectiveObject.m_status = "set";
    newItemObjectiveObject.m_dataIsNotLocked = true;
    newItemObjectiveObject.m_id = id;
    newItemObjectiveObject.m_ownerId = parseInt(dataList[2]); // 0: Nothing
    newItemObjectiveObject.m_itemType = parseInt(dataList[3]); // 0: PICKUP, 1: OWNED
    newItemObjectiveObject.m_ownerType = parseInt(dataList[4]); // 0: SELF, 1: PLAYER, 2: NPC
    newItemObjectiveObject.m_position = { x: parseFloat(dataList[5]), y: parseFloat(dataList[6]) };
    newItemObjectiveObject.m_localScaleX = parseInt(dataList[7]);
    newItemObjectiveObject.m_state = parseInt(dataList[8]); // 0: NONE, 1: COMPLETED, 2: DESTROYED


    newItemObjectiveObject.m_changedData = {
        positionX: "",
        positionY: "",
        localScaleX: "",
        state: ""
    }

    //Ensure that the position is within the bounds of the canvas

    newItemObjectiveObject.Update = function (data) {

        //"Action, id, ownerId, ItemType, OwnerType, position_X, position_Y, transform.localScale_X, state";
        //      0,  1,       2,        3,         4,          5,          6,                      7,     8
        if (data[5] != "") {
            this.m_position.x = parseFloat(data[5]);
            this.m_changedData.positionX = data[5];
        }
        if (data[6] != "") {
            this.m_position.y = parseFloat(data[6]);
            this.m_changedData.positionY = data[6];
        }
        if (data[7] != "") {
            this.m_localScaleX = parseInt(data[7]);
            this.m_changedData.localScaleX = data[7];
        }
        if (data[8] != "") {
            this.m_state = parseInt(data[8]);
            this.m_changedData.state = data[8];
            console.log(`State is now: ${data[8]}`);
        }
    }

    newItemObjectiveObject.GetChangedData = function () {

        //"Action, id, ownerId, ItemType, OwnerType, position_X, position_Y, transform.localScale_X, state";
        //      0,  1,       2,        3,         4,          5,          6,                      7,     8
        var changedData = `${this.m_id},,,,`;
        changedData += `${this.m_changedData.positionX},`;
        changedData += `${this.m_changedData.positionY},`;
        changedData += `${this.m_changedData.localScaleX},`;
        changedData += `${this.m_changedData.state}`;

        newItemObjectiveObject.m_changedData = {
            positionX: "",
            positionY: "",
            localScaleX: "",
            state: "",
        }
        if (changedData == `,${id},,,,,,,`)
            changedData = "Unchanged";

        return changedData;
    }

    newItemObjectiveObject.GetAllData = function () {

        //"Action, id, ownerId, ItemType, OwnerType, position_X, position_Y, transform.localScale_X, state";
        //      0,  1,       2,        3,         4,          5,          6,                      7,     8
        var allData = `${this.m_id},`;
        allData += `${this.m_ownerId},`;
        allData += `${this.m_itemType},`;
        allData += `${this.m_ownerType},`;
        allData += `${this.m_position.x},`;
        allData += `${this.m_position.y},`;
        allData += `${this.m_localScaleX},`;
        allData += `${this.m_state}`;

        return allData;
    }

    newItemObjectiveObject.InteractSuccess = function () {

        // ITEM_STATE { NONE, INACTIVE, COMPLETED, INTERACT, DESTROYED }
        //                 0,        1,         2,        3,         4

        return this.m_state == 0;
    }

    return newItemObjectiveObject;
}

module.exports.CreateItemObjective = CreateItemObjective;