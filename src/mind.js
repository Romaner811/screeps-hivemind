const cfg = require("./config");
const util = require("./util.cjs");
const creeps = require("./creeps");
const tsk = require("./tsk");


class ColonyMind
{
    constructor(data) //#> data into memory how
    {
        this.data = data;
        if (Memory.tasks == null)
        {
            Memory.tasks = { };
        }

        this.tasker = new tsk.TaskManager(new tsk.TaskPool(
            Memory.tasks,
            new tsk.TaskFactory(Memory.tasks)
            ));
    }

    tick()
    {
        
    }
}


module.exports = {
    ColonyMind
};
