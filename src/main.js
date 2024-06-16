//const cfg = require("./config");

/*
const tsk = require("./tsk");
const util = require("./util");
*/

//const mind = require("./mind");
const util = require("./util.cjs");

/*
const TASK_HARVEST = "harvest";
class HarvestTask extends Task
{
    constructor(id, resource, room_obj)
    {
        super(id, TASK_HARVEST);

        this.data.order = {
            resource: resource,
            source: room_obj.id,
            source_pos: room_obj.pos,
        };
    }

    describe()
    {
        return `⛏ ${resource}@${util.describe_pos(room_obj.pos)}`;
    }
    
    tick()
    {
        throw new util.NotImplementedError();
    }
}


const TASK_DELIVERY = "deliver";
class DeliveryTask extends Task
{
    constructor(id, destination, resource, amount)
    {
        super(id, TASK_DELIVERY);

        this.data.order = {
            resource: resource,
            amount: amount,
            destination: destination
        };
    }

    describe()
    {
        return `${destination.constructor.name}<-${resource}x${amount}`;
    }
    
    tick()
    {
        throw new util.NotImplementedError();
    }
}
*/




function main()
{
    return;

    /*
    const colony_mind = new mind.ColonyMind();

    colony_mind.tasker.tick_tasks();
    colony_mind.tick();
    colony_mind.tasker.cleanup();
    */
}

module.exports.loop = main;
