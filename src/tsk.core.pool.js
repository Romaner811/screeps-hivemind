const util = require("./util.cjs");

const err = require("./tasks.core.error");
const tsk = require("./tasks.core.task");
const tsk_factory = require("./tasks.core.factory");


const STATUS_NONE = 0;
const STATUS_COMPLETED = 1;
const STATUS_WORKING = 10;
const STATUS_BLOCKED = 11;
const STATUS_SLEEP = 12;


class TaskPool
{
    constructor(data, factory) //#> receiving data means first frame no memo and not inserting memo.
    {
        this.data = data || TaskPool.make_blank_data();
        this.factory = factory;

        if ((this.data.blocked instanceof Set) == false)
        {
            this.data.blocked = new Set(this.data.blocked);
        }

        this.completed = { };   // tid: bool success
        this.unclassified = [ ];
    }

    static make_blank_data()
    {
        return {
            task: { },

            backlog: [ ],
            
            work: [ ],
            blocked: new Set(),
            sleep: [ ],
        };
    }

    get_task(task_id)
    {
        const task_data = this.data.task[task_id];

        if (task_data == null) return null;

        return this.factory.get(task_data);
    }

    get_status(task)
    {
        if (task.is_completed)
        {
            return STATUS_COMPLETED;
        }
        else if (task.state.awaiting)
        {
            return STATUS_BLOCKED;
        }
        else if (task.state.sleep)
        {
            return STATUS_SLEEP;
        }
        else if (task.is_started)
        {
            return STATUS_WORKING;
        }

        return STATUS_NONE;
    }

    classify(task)
    {
        const status = this.get_status(task);
        
        switch (status)
        {
            case STATUS_COMPLETED:
                this.pool.completed[task_id] = task.state.success;
                break;
            
            case STATUS_BLOCKED:
                this.data.blocked.add(task.id);
                break;
            
            case STATUS_SLEEP:
                // todo: sort by awakening time.
                this.data.sleep.push(task.id);
                break;
            
            case STATUS_WORKING:
                this.data.work.push(task.id);
                break;

            default:
                this.data.backlog.push(task.id);
                break;
        }

        return status;
    }

    unclassify(task)
    {
        const status = this.get_status(task);
        
        switch (status)
        {
            case STATUS_COMPLETED:
                delete this.pool.completed[task.id];
                break;
            
            case STATUS_BLOCKED:
                this.data.blocked.delete(task.id);
                break;
            
            case STATUS_SLEEP:
                // todo: search by awakening time.
                util.arr_remove(this.data.sleep, task.id);
                break;
            
            case STATUS_WORKING:
                util.arr_remove(this.data.work, task.id);
                break;

            default:
                util.arr_remove(this.data.backlog, task.id);
                break;
        }

        return status;
    }

    satisfy(task_id)
    {
        const task = this.get_task(task_id);

        if (task.state.blocking == null) return;

        const blocked = task.state.blocking;

        while (true)
        {
            const blocked_task_id = blocked.pop();
            if (blocked_task_id == null) break;
            
            const blocked_task = this.get_task(blocked_task_id);
            if (blocked_task == null) continue;
            
            blocked_task.satisfy(task_id);
            
            if (blocked_task.state.awaiting == null)
            {
                this.data.blocked.delete(blocked_task.id);
                this.unclassified.push(blocked_task);
            }
        }

        delete task.state.blocking;
    }

    submit(task)
    {
        this.factory.remember(task);
        
        this.data.task[task.id] = task.data;
        this.unclassified.push(task);

        for (const dependency_id of task.state.awaiting)
        {
            const dependency = this.get_task(dependency_id);
            dependency.state.blocking.push(task.id);
        }
    }

    forget(task_id)
    {
        const task = this.get_task(task_id);
        if (task == null) return null;

        // make all blocked tasks forget about me.
        this.satisfy(task_id);

        // make all blocking tasks forget about me.
        if (task.state.awaiting != null)
        {
            for (const dependency_id of task.state.awaiting)
            {
                const dependency = this.get_task(dependency_id);
                dependency.unblock(task_id);
            }
        }

        // remove me from classified lists.
        this.unclassify(task);
        
        // remove from pool. (and memory)
        delete this.data.task[task_id];
        
        return task;
    }
}


module.exports = {
    ...tsk,
    ...tsk_factory,

    STATUS_NONE,
    STATUS_COMPLETED,
    STATUS_WORKING,
    STATUS_BLOCKED,
    STATUS_SLEEP,

    TaskPool,
};
