

function CreatePlayerObject(id, name, color, totalPoints, titles) {
    var newPlayerObject = {};
    newPlayerObject.m_status = "set";
    newPlayerObject.m_dataIsNotLocked = true;
    newPlayerObject.m_id = id;
    newPlayerObject.m_position = { x: 0, y: 0 };
    newPlayerObject.m_localScaleX = 1;
    newPlayerObject.m_state = 0; // 0: idle, 1: moving, 2: dazed
    newPlayerObject.m_carriedItem = 0; // 0: Nothing
    newPlayerObject.m_titles = titles; // 
    newPlayerObject.m_points = 0;  //
    newPlayerObject.m_totalPoints = totalPoints;  //
    newPlayerObject.m_name = name;
    newPlayerObject.m_color = color;

    newPlayerObject.m_changedData = {
        positionX: "",
        positionY: "",
        localScaleX: "",
        state: "",
        carriedItem: "",
        titles: "",
        points: "",
        totalPoints: ""
    }

    //Ensure that the position is within the bounds of the canvas

    newPlayerObject.Update = function (data) {

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

    newPlayerObject.NameChange = function (name) {
        newPlayerObject.m_name = name;
    }

    newPlayerObject.GetChangedData = function () {

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


        newPlayerObject.m_changedData = {
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

    newPlayerObject.GetAllData = function () {

        //"Action, id, position_X, position_Y, m_playerSprite.localScale_X, state, carriedItem, titles, points, totalPoints, name, color";
        //      0,  1,          2,          3,                           4,     5,           6,      7,      8,           9,   10,    11


        var allData = `${this.m_id},`;
        allData += `${this.m_position.x},`;
        allData += `${this.m_position.y},`;
        allData += `${this.m_localScaleX},`;
        allData += `${this.m_state},`;
        allData += `${this.m_carriedItem},`;
        allData += `${this.m_titles},`;
        allData += `${this.m_points},`;
        allData += `${this.m_totalPoints},`;
        allData += `${this.m_name},`;
        allData += `${this.m_color.r}|${this.m_color.g}|${this.m_color.b}`;

        return allData;
    }

    return newPlayerObject;
}

module.exports.CreatePlayerObject = CreatePlayerObject;