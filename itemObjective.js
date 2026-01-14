

function CreatePlayerObject(id, dataList) {

    //"Action, id, state, carriedItem, neededItems";
    //      0,  1,     2,           3,           4

    var newItemObjectiveObject = {};
    newItemObjectiveObject.m_status = "set";
    newItemObjectiveObject.m_id = id;
    newItemObjectiveObject.m_state = parseInt(dataList[2]); // 0: idle, 1: moving, 2: dazed
    newItemObjectiveObject.m_supplyItem = 0; // 0: Nothing
    newItemObjectiveObject.m_neededItem = new Map(); // Dictionary of 

    let listOfNeededItems = dataList[4].Split('|');

    newItemObjectiveObject.m_changedData = {
        state: "",
        supplyItem: ""
    }

    //Ensure that the position is within the bounds of the canvas

    newItemObjectiveObject.Update = function (data) {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state, carriedItem, titles, points";
        //      0,  1,          2,          3,                           4,     5,           6,      7,      8
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
        if (data[6] != "") {
            this.m_carriedItem = parseInt(data[6]);
            this.m_changedData.carriedItem = data[6];
        }
        if (data[7] != "") {
            this.m_titles = data[7];
            this.m_changedData.titles = data[7];
        }
        if (data[8] != "") {
            console.log("Updating points to: " + data[8]);
            this.m_points = parseInt(data[8]);
            this.m_changedData.points = data[8];
        }
    }

    newItemObjectiveObject.NameChange = function (name) {
        newItemObjectiveObject.m_name = name;
    }

    newItemObjectiveObject.GetChangedData = function () {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state, carriedItem, titles, points";
        //      0,  1,          2,          3,                           4,     5,           6,      7,      8
        var changedData = `${this.m_id},`;
        changedData += `${this.m_changedData.positionX},`;
        changedData += `${this.m_changedData.positionY},`;
        changedData += `${this.m_changedData.localScaleX},`;
        changedData += `${this.m_changedData.state},`;
        changedData += `${this.m_changedData.carriedItem},`;
        changedData += `${this.m_changedData.titles},`;
        changedData += `${this.m_changedData.points},`;


        newItemObjectiveObject.m_changedData = {
            positionX: "",
            positionY: "",
            localScaleX: "",
            state: "",
            carriedItem: "",
            titles: "",
            points: ""
        }
        if (changedData == `${this.m_id},,,,,,,`)
            changedData = "Unchanged";

        return changedData;
    }

    newItemObjectiveObject.GetAllData = function () {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state, carriedItem, titles, points, totalPoints, name, color";
        //      0,  1,          2,          3,                           4,     5,           6,      7,      8,           9,   10,    11


        var allData = `${this.m_id},`;
        allData += `${this.m_position.x},`;
        allData += `${this.m_position.y},`;
        allData += `${this.m_localScaleX},`;
        allData += `${this.m_state},`;
        allData += `${this.m_supplyItem},`;
        allData += `${this.m_titles},`;
        allData += `${this.m_points},`;
        allData += `${this.m_totalPoints},`;
        allData += `${this.m_name},`;
        allData += `${this.m_color.r}|${this.m_color.g}|${this.m_color.b}`;

        return allData;
    }

    return newItemObjectiveObject;
}

module.exports.CreatePlayerObject = CreatePlayerObject;