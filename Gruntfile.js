// https://docs.screeps.com/commit.html

const BRANCH_DEV = "dev";
const BRANCH_MAIN = "default";

const DEFAULT_BRANCH = BRANCH_DEV;

const FILE_SCREEPS_AUTH = "screeps.auth.secret";

const TASK_SCREEPS = "_screeps";
const CFGKEY_SCREEPS_BRANCH = TASK_SCREEPS + ".options.branch";


function make_screeps_cfg(branch)
{
    if (branch == null)
    {
        branch = DEFAULT_BRANCH;
    }

    return {
        options: {
            email: "<%= secret.screeps.auth.email %>",
            token: "<%= secret.screeps.auth.token %>",
            // https://docs.screeps.com/auth-tokens.html
            branch: branch,
            //server: "season"  //3?
        },
        dist: {
            src: ["dist/*.js"]
        }
    };
}

function sync_screeps(grunt, task, branch, is_dry)
{
    if (branch != null)
    {
        grunt.config.set(CFGKEY_SCREEPS_BRANCH, branch);
    }

    grunt.log.writeln(
        "cfg." + TASK_SCREEPS + ":",
        JSON.stringify(grunt.config.get(TASK_SCREEPS), null, 4)
        );
    
    if (is_dry) return;
    grunt.task.run(TASK_SCREEPS);
}


module.exports = function(grunt) {
    grunt.task.loadNpmTasks("grunt-screeps");
    grunt.task.renameTask("screeps", TASK_SCREEPS);
    
    grunt.config.init({
        secret: {
            screeps: {
                auth: grunt.file.readJSON(FILE_SCREEPS_AUTH)
            }
        },
        [TASK_SCREEPS]: make_screeps_cfg()
    });

    grunt.task.registerTask("sync", function(branch)
    {
        sync_screeps(grunt, this, branch, false);
    });
    
    grunt.task.registerTask("cfg", function(branch)
    {
        sync_screeps(grunt, this, branch, true);
    });
    
    //grunt.registerTask("default", ["sync_screeps"]);
};

/*
    TODO: allow using current branch in github workflow
    - produce the secrets into a temporary file
    - inject secrets into initConfig
    - get branch name as argument and inject it into screeps options config.
*/

/*
    TODO: screepsify
    - flatten folders
    - replace require paths
    - cjs -> js
*/

/*
    TODO: local sync ?
*/
