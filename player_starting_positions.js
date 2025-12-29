

function GetPlayerPositionAndFacing(id, level_name) {

    var playerPositionAndFacing = {
        x: "0",
        y: "0",
        facing: "1",
    }
    console.log(level_name);
    switch (level_name) {
        case "trap_making":
            if (id == 0 || id == 1) {
                playerPositionAndFacing.y = "8.88";
            }
            if (id == 2 || id == 3) {
                playerPositionAndFacing.y = "4.15";
            }
            if (id == 0 || id == 2) {
                playerPositionAndFacing.x = "2.65";
                playerPositionAndFacing.facing = "1";
            }
            if (id == 1 || id == 3) {
                playerPositionAndFacing.x = "7.7";
                playerPositionAndFacing.facing = "-1";
            }
            break;
    }

    return playerPositionAndFacing;
}

module.exports.GetPlayerPositionAndFacing = GetPlayerPositionAndFacing;