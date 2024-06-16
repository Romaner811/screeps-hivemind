const { Task } = require("./tsk.core.task.cjs");


/** @class */
class TaskFactory
{
    static constructors = { };

    /**
     * 
     * @param {object} data {@link TaskFactory.make_blank_data}
     */
    constructor(data) //#>
    {
        this.data = data || TaskFactory.make_blank_data();
        this.cache = { };
    }
    
    /**
     * 
     * @returns {object}
     */
    static make_blank_data()
    {
        return {
            next_id: 0
        };
    }
    
    /**
     * 
     * @returns {number}
     */
    next_id()
    {
        this.data.next_id += 1;
        return this.data.next_id;
    }

    /**
     * 
     * @param {Task} task 
     */
    remember(task)
    {
        this.cache[task.id] = task;
    }

    /**
     * 
     * @param {number} task_id 
     * @returns {Task|null}
     */
    recall(task_id)
    {
        return this.cache[task_id];
    }

    /**
     * 
     * @param {object} task_data {@link module:tsk} .Task.make_blank_data}
     * @returns {Task}
     */
    get(task_data)
    {
        let task = this.recall(task_data.id);

        if (task != null) return task;

        const ctor = TaskFactory.constructors[task_data.type];
        
        task = new ctor(task_data);

        this.remember(task);
        return task;
    }
}


module.exports = {
    Task,
    TaskFactory
};
