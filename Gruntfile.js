// https://docs.screeps.com/commit.html

const BRANCH_DEV = "dev";
const BRANCH_MAIN = "default";
const DEFAULT_BRANCH = BRANCH_DEV;

const ARG_DELIM = ":";
// config flags
const CFGTASK_DRY = "dry";
const CFGTASK_VERBOSE = "verbose";
const CFGTASK_FORCE = "force";
// config
const TASK_BRANCH = "branch";
// build
const TASK_BUILD = "build";
const TASK_SCREEPSIFY = "screepsify";
// screeps
const TASK_UPLOAD = "upload";
// master
const TASK_DEPLOY = "deploy";

const CFGKEY_DRY = "is_dry";
const CFGKEY_VERBOSE = "is_verbose";
const CFGKEY_FORCE = "force";
const CFGKEY_SCREEPS_BRANCH = TASK_UPLOAD + ".options.branch";

const FILE_SCREEPS_AUTH = "screeps.auth.secret";

const DIR_SOURCE = "src";
const DIR_DIST = "dist";

const DIR_SCREEPSIFIED_CODE = DIR_DIST;


module.exports = function(grunt) {
    grunt.config.init({
        // settings
        [CFGKEY_DRY]: false,
        [CFGKEY_VERBOSE]: false,
        [CFGKEY_FORCE]: false,
        // secret
        secret: {
            screeps: {
                auth: grunt.file.readJSON(FILE_SCREEPS_AUTH)
            }
        },
        // tasks
        [TASK_SCREEPSIFY]: {
            dist: {
                files: [
                    {
                        src: [ DIR_SOURCE + "/**" ],
                        dest: DIR_SCREEPSIFIED_CODE,
                        filter: "isFile"
                    }
                ]
            }
        },
        [TASK_UPLOAD]: {
            options: {
                email: "<%= secret.screeps.auth.email %>",
                token: "<%= secret.screeps.auth.token %>",
                // https://docs.screeps.com/auth-tokens.html
                branch: DEFAULT_BRANCH,
                //server: "season"  //3?
            },
            dist: {
                src: [ DIR_DIST + "/*.js" ]
            }
        }
    });

    grunt.task.registerTask(CFGTASK_DRY, function()
    {
        grunt.config.set(CFGKEY_DRY, true);
    });

    grunt.task.registerTask(CFGTASK_VERBOSE, function()
    {
        grunt.config.set(CFGKEY_VERBOSE, true);
    });
    
    grunt.task.registerTask(CFGTASK_FORCE, function()
    {
        grunt.config.set(CFGKEY_FORCE, true);
    });

    grunt.task.registerTask(TASK_BRANCH, function(branch)
    {
        if (branch == null)
        {
            branch = DEFAULT_BRANCH;
        }

        grunt.config.set(CFGKEY_SCREEPS_BRANCH, branch);
        
        if (grunt.config.get(CFGKEY_VERBOSE))
        {
            grunt.log.writeln(CFGKEY_SCREEPS_BRANCH + " = " + JSON.stringify(branch) + ";");
        }
    });

    let build_tasks =  [ ];
    grunt.task.registerTask(TASK_BUILD, function() {
        grunt.log.writeln("build_tasks:", JSON.stringify(build_tasks));
        grunt.task.exists(build_tasks);
        grunt.task.run(build_tasks);
    });

    grunt.task.registerTask(TASK_SCREEPSIFY, function()
    {
        // TODO:
        // cjs -> js
        // flatten folders
        // replace require paths
        throw new Error("not implemented: task " + TASK_SCREEPSIFY);
    });
    build_tasks.push(TASK_SCREEPSIFY);
    
    grunt.task.loadNpmTasks("grunt-screeps");
    grunt.task.registerTask(TASK_UPLOAD, function()
    {
        if (grunt.config.get(CFGKEY_VERBOSE))
        {
            grunt.log.writeln(
                TASK_UPLOAD + ":",
                JSON.stringify(grunt.config.get(TASK_UPLOAD), null, 4)
                );
        }
        
        if (grunt.config.get(CFGKEY_DRY))
        {
            grunt.log.writeln("dry deployment: did not deploy.");
            return;
        }
        
        if (grunt.config.get(CFGKEY_FORCE) != true)
        {
            grunt.task.requires(build_tasks);
        }
        
        grunt.task.renameTask("screeps", TASK_UPLOAD);
        grunt.task.run(TASK_UPLOAD);
    });

    grunt.task.registerTask(TASK_DEPLOY, function(branch)
    {
        let tasks = [ ];
        
        if (branch != null)
        {
            tasks.push(TASK_BRANCH + ARG_DELIM + branch);
        }

        tasks.push(
            TASK_SCREEPSIFY,
            TASK_UPLOAD
            );
        
        grunt.task.run(tasks);
    });
};
