/** @module */

const { Task } = require("./tsk.core.task.cjs");


/** @class
* @extends {Error}
*/
class TaskError extends Error
{
    /**
     * {@link tsk.core.task.Task}
     * @param {Task} task 
     * @param {string} message 
     */
    constructor(task, message)
    {
        super(task.toString() + ": " + message);

        this.task = task;
    }
}


/** @class
 * @extends {TaskError}
 */
class TaskImpossibleError extends TaskError { }


module.exports = {
    TaskError,
    TaskImpossibleError
};
