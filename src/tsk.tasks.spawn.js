const util = require("./util.cjs");

const creeps = require("./creeps");
const tsk = require("./tsk.core");


const TASK_SPAWN = "spawn";
class SpawnTask extends tsk.Task
{
    static poll_interval = 10;
    
    static spawn_progress_update_count = 4;

    static create(id, creep_type, template_name)
    {
        const data = SpawnTask.make_blank_data(id, TASK_SPAWN);

        data.order = {
            type: creep_type,
            tempalte: template_name
        };

        return new SpawnTask(data);
    }

    describe()
    {
        return `+${this.order.type}.${this.order.tempalte}`;
    }

    #spawn;
    get spawn()
    {
        if (this.#spawn == null)
        {
            this.#spawn = Game.spawns[this.assignee];
        }
        
        return this.#spawn;
    }

    #template;
    get template()
    {
        if (this.#template == null)
        {
            this.#template = creeps.templates[this.order.type][this.order.template];
        }

        return this.#template;
    }

    get_creep_name()
    {
        return `${this.order.type}:${this.order.template}#${this.id}`;
    }

    try_start_spawn()
    {
        let result = this.spawn.spawnCreep(this.template.body, this.get_creep_name());
        
        switch (result)
        {
        case OK:
            this.state.spawn_start = Game.time;
            return true;

        case ERR_BUSY:
        case ERR_NOT_ENOUGH_ENERGY:
            this.sleep(SpawnTask.poll_interval);
            break;
        
        default:
            throw new task.TaskError(this, `unexpected result: ${result}`);
        }
        
        return false;
    }

    await_spawn(est)
    {
        this.sleep(Math.min(
            this.template.spawn_delay / SpawnTask.spawn_progress_update_count,
            est
            ));
    }

    tick()
    {
        if (this.template.cost > this.spawn.room.energyCapacityAvailable)
        {
            throw new task.TaskImpossibleError(
                "too much energy required: "
                `${this.template.cost}/${this.spawn.room.energyCapacityAvailable}`
                );
        }

        if (this.state.spawn_start == null)
        {
            this.try_start_spawn();
            return;
        }

        const waited = Game.time - this.state.spawning_started;
        const est = this.template.spawn_delay - waited;
        
        this.state.progress = (waited / this.template.spawn_delay);

        if (est > 1)
        {
            this.await_spawn(est);
            return;
        }

        if (this.spawn.spawning == null)
        {
            this.complete();
        }
        
        return;
    }
}
tsk.TaskFactory.constructors[TASK_SPAWN] = SpawnTask;

module.exports = {
    TASK_SPAWN,
    TaskSpawn
};
