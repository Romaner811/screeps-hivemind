const err = require("./tasks.core.error");
const tsk = require("./tasks.core.task");
const pool = require("./tasks.core.pool");
const tsk_factory = require("./tasks.core.factory");


class TaskManager
{
    constructor(pool)
    {
        this.pool = pool;
    }

    tick_tasks()
    {
        while (true)
        {
            const task_id = this.pool.data.work.pop();
            if (task_id == null) break;

            const task = this.pool.get_task(task_id);
            
            try
            {
                task.tick();
            }
            catch (error)
            {
                if (error instanceof err.TaskError)
                {
                    task.complete(false);
                    console.log(error);
                }
                else
                {
                    throw error;
                }
            }
            finally
            {
                this.pool.unclassified.push(task_id);
            }
        }

        // sleep checks
    }

    cleanup()
    {
        // #> TODO: who first - completed or unclassified...
        // an unclassified might become a completed but a completed can cause more classified.
        for (const task_id of this.pool.unclassified)
        {
            const task = this.pool.get_task(task_id);
            this.pool.classify(task);
        }

        for (const task_id of Object.keys(this.pool.completed))
        {
            this.pool.forget(task_id);
        }
    }
}


module.exports = {
    ...err,
    ...tsk,
    ...tsk_factory,
    ...pool,
    TaskManager
};
