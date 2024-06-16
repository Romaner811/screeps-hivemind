

const MOVE_POWER = 2;
/*
    CARRY_CAPACITY: 50,
    HARVEST_POWER: 2,
    HARVEST_MINERAL_POWER: 1,
    HARVEST_DEPOSIT_POWER: 1,
    REPAIR_POWER: 100,
    DISMANTLE_POWER: 50,
    BUILD_POWER: 5,
    ATTACK_POWER: 30,
    UPGRADE_CONTROLLER_POWER: 1,
    RANGED_ATTACK_POWER: 10,
    HEAL_POWER: 12,
    RANGED_HEAL_POWER: 4,
    REPAIR_COST: 0.01,
    DISMANTLE_COST: 0.005,
*/


function calc_extras(template)
{
    let extras = {
        cost: 0,
        spawn_delay: CREEP_SPAWN_TIME * template.body.length
    };

    for (const part of template.body)
    {
        extras.cost += BODYPART_COST[part];

        switch (part)
        {
        case MOVE:
            extras.power = (extras.power || 0) + MOVE_POWER;
            break;
        case CARRY:
            extras.capacity = (extras.power || 0) + CARRY_CAPACITY;
            break;
        }
    }

    return extras;
}


const CREEP_ROLES = {
    WORKER: "worker",
    DELIVERY: "delivery",
    DRAGGER: "dragger",
    CONTAINER: "container",
};

const CREEPS_TEMPLATES_LIST = [
    // worker
    {
        name: "lvl1",
        role: CREEP_ROLES.WORKER,
        // cost: 200,
        // capacity: 50,
        body: [
            WORK, MOVE,
            CARRY
        ],
    },
    {
        name: "lvl2",
        role: CREEP_ROLES.WORKER,
        // cost: 300,
        // capacity: 100,
        body: [
            WORK, MOVE,
            CARRY, MOVE,
            CARRY
        ],
    },
    {
        name: "lvl3",
        role: CREEP_ROLES.WORKER,
        // cost: 500,
        // capacity: 100,
        body: [
            CARRY, MOVE,
            CARRY, MOVE,
            WORK, MOVE,
            WORK, MOVE
        ],
    },
    {
        name: "lvl3:engineer",
        role: CREEP_ROLES.WORKER,
        // cost: 500,
        // capacity: 50,
        body: [
            CARRY,
            WORK, MOVE,
            WORK, MOVE,
            WORK, MOVE
        ],
    },
    {
        name: "lvl3:carrier",
        role: CREEP_ROLES.WORKER,
        // cost: 500,
        // capacity: 200,
        body: [
            WORK, MOVE,
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE
        ],
    },

    // deliverers
    {
        name: "lvl1",
        role: CREEP_ROLES.DELIVERY,
        // cost: 100,
        // capacity: 50,
        body: [
            MOVE, CARRY
        ],
    },
    {
        name: "lvl2",
        role: CREEP_ROLES.DELIVERY,
        // cost: 300,
        // capacity: 150,
        body: [
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE,
        ],
    },
    {
        name: "lvl3",
        role: CREEP_ROLES.DELIVERY,
        // cost: 500,
        // capacity: 250,
        body: [
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE,
            CARRY, MOVE
        ],
    },

    // dragger
    {
        name: "lvl1",
        role: CREEP_ROLES.DRAGGER,
        // cost: 100,
        // power: 4,
        body: [
            MOVE, MOVE,
        ],
    },
    {
        name: "lvl2",
        role: CREEP_ROLES.DRAGGER,
        // cost: 300,
        // power: 12,
        body: [
            MOVE, MOVE,
            MOVE, MOVE,
            MOVE, MOVE,
        ],
    },
    {
        name: "lvl3",
        role: CREEP_ROLES.DRAGGER,
        // cost: 500,
        // power: 20,
        body: [
            MOVE, MOVE,
            MOVE, MOVE,
            MOVE, MOVE,
            MOVE, MOVE,
            MOVE, MOVE,
        ],
    },

    // containers
    {
        name: "lvl2",
        role: CREEP_ROLES.CONTAINER,
        // cost: 300,
        // capacity: 250,
        body: [
            MOVE, CARRY,
            CARRY, CARRY,
            CARRY, CARRY
        ],
    },
    {
        name: "lvl3",
        role: CREEP_ROLES.CONTAINER,
        // cost: 500,
        // capacity: 450,
        body: [
            MOVE, CARRY,
            CARRY, CARRY,
            CARRY, CARRY, 
            CARRY, CARRY, 
            CARRY, CARRY
        ],
    },
];
const CREEP_TEMPLATES = { };
for (const creep of CREEPS_TEMPLATES_LIST)
{
    let role_map = CREEP_TEMPLATES[creep.role];
    if (role_map == null)
    {
        CREEP_TEMPLATES[creep.role] = role_map = { };
    }
    role_map[creep.name] = creep;
    Object.assign(creep, calc_extras(creep));
}

module.exports = {
    roles: CREEP_ROLES,
    templates: CREEP_TEMPLATES,
};

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
