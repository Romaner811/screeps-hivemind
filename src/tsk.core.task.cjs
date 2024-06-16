/** @module */

const util = require("./util.cjs");

/**
 * @typedef UniqueRoomObject
 * @type {RoomObject & {id: string}}
 */


/** @class */
class Task
{
    static create(id, type)
    {
        const data = Task.make_blank_data(id, type);
        const task = new Task(data);
        return task;
    }

    constructor(data)
    {
        this.data = data;
    }

    /** @returns {object} */
    static make_blank_data(id, type)
    {
        return {
            id: id,                 //  int unique
            type: type,             //  string

            assignee: [ ],          //  RoomObject[]

            state: {
                //progress: 0,        //  float % -> 0.00-1.00
                //success: false,     //  bool
                
                //sleep: 0,           //  int until tick
                
                //awaiting: [ ],      //  int[] task ids
                //blocking: [ ],      //  int[] task ids
            },
            
            order: { }              // to be used by implementing task
        };
    }

    /** @returns {number} */
    get id()
    {
        return this.data.id;
    }

    /** @returns {object} */
    get type()
    {
        return this.data.type;
    }

    /** @returns {object} */
    get state()
    {
        return this.data.state;
    }

    /** @returns {object} */
    get order()
    {
        return this.data.order;
    }

    /** @returns {boolean} */
    get is_stared()
    {
        return this.state.progress != null;
    }
    
    /** @returns {boolean} */
    get is_completed()
    {
        return this.state.success != null;
    }

    /** @returns {UniqueRoomObject} */
    get assignee()
    {
        return this.data.assignee[0];
    }

    /**
     * 
     * @returns {string}
     */
    describe()
    {
        return this.type;
    }

    /**
     * 
     * @returns {string}
     */
    toString()
    {
        return `[${this.id}]${this.describe()}`;
    }

    /**
     * 
     * @param {UniqueRoomObject} assignee 
     */
    assign(assignee)
    {
        this.data.assignee.push(assignee.id);
        //assignee.memory.task = this.id;
    }

    /**
     * 
     * @param {UniqueRoomObject} assignee 
     */
    unassign(assignee)
    {
        //delete assignee.memory.task;
        util.arr_remove(this.data.assignee, assignee.id);
    }

    /**
     * 
     * @param {boolean} success 
     */
    complete(success)
    {
        this.state.progress = 1;
        this.state.success = success;
    }

    /**
     * 
     * @param {string} list_name 
     * @param {number} task_id 
     * @returns {boolean}
     */
    #forget(list_name, task_id)
    {
        if (this.state[list_name] == null) return false;

        let removed = util.arr_remove(this.state[list_name], task_id);
        if (removed == false) return false;

        if (this.state[list_name].length == 0)
        {
            delete this.state[list_name];
        }

        return true;
    }

    /**
     * @param {number} task_id
     */
    require(task_id)
    {
        let awaiting = (this.state.awaiting || [ ]);
        awaiting.push(task_id);
    }

    /**
     * @param {number} task_id
     */
    satisfy(task_id)
    {
        return this.#forget("awaiting", task_id);
    }

    /**
     * @param {number} task_id
     */
    block(task_id)
    {
        let blocking = (this.state.blocking || [ ]);
        blocking.push(task_id);
    }

    /**
     * @param {number} task_id
     */
    unblock(task_id)
    {
        return this.#forget("blocking", task_id);
    }

    /**
     * @param {number} ticks
     */
    sleep(ticks)
    {
        if (ticks < 1) return;

        this.state.sleep = (this.state.sleep || Game.time) + ticks;
    }

    tick()  // virtual
    {
        // dummy implementation
        this.complete(true);
    }
}


module.exports = {
    Task
};
