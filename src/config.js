const creeps = require("./creeps");

const CAPITAL_SPAWN = "Whiterun";

const config = {
    // spawn names
    capital_spawn: CAPITAL_SPAWN,
    spawn_names: [ CAPITAL_SPAWN, "Riverwood", "Rorikstead" ],

    creep_alloc: {
        [creeps.roles.WORKER]: 3
    },
};

module.exports = config;

/*
    BODYPART_COST: {
        "move": 50,
        "work": 100,
        "attack": 80,
        "carry": 50,
        "heal": 250,
        "ranged_attack": 150,
        "tough": 10,
        "claim": 600
    },
*/
