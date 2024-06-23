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
const CFGTASK_BRANCH = "branch";
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

const FILE_SCREEPS_AUTH = "./screeps.auth.secret";

const DIR_SOURCE = "./src/";
const DIR_DIST = "./dist/";

const DIR_SCREEPSIFIED_CODE = DIR_DIST;


function log_verbose_config(grunt, task)
{
    if (grunt.config.get(CFGKEY_VERBOSE) != true) return;
    
    grunt.log.writeln("config", task.name + ":");
    grunt.log.writeln(
        JSON.stringify(grunt.config.get(task.name), null, 4)
        );
}


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
                        src: [ DIR_SOURCE + "**" ],
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
                src: [ DIR_DIST + "*.js" ]
            }
        }
    });

    grunt.task.registerTask(
        CFGTASK_DRY,
        "config flag, make all tasks be verbose.",
        function()
        {
            grunt.config.set(CFGKEY_DRY, true);
        });

    grunt.task.registerTask(
        CFGTASK_VERBOSE,
        "config flag, dont produce any side effcts.",
        function()
        {
            grunt.config.set(CFGKEY_VERBOSE, true);
        });
    
    grunt.task.registerTask(
        CFGTASK_FORCE,
        "config flag, allow uploading a failed build.",
        function()
        {
            grunt.config.set(CFGKEY_FORCE, true);
        });

    let build_tasks =  [ ];
    grunt.task.registerTask(
        TASK_BUILD,
        `equivalent to all build tasks. \"built\" code is stored in \`${DIR_DIST}\`.`,
        function()
        {
            grunt.log.writeln("build_tasks:", JSON.stringify(build_tasks));
            grunt.task.exists(build_tasks);
            grunt.task.run(build_tasks);
        });

    grunt.task.registerTask(
        TASK_SCREEPSIFY,
        "rearrange the code for screeps\n" +
        "    - flatten folder modules.\n" +
        "    - replace extension: \`*.cjs\` -> \`*.js\`.\n" +
        "    - update \`require()\`s in all files.`\n",
        function()
        {
            log_verbose_config(grunt, this);

            for (const file of this.files)
            {

            }
        });
    build_tasks.push(TASK_SCREEPSIFY);
    
    grunt.task.registerTask(
        CFGTASK_BRANCH,
        `config, set target branch for \`upload\`. (default: \`${DEFAULT_BRANCH}\`)`,
        function(branch)
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

    grunt.task.loadNpmTasks("grunt-screeps");
    grunt.task.registerTask(
        TASK_UPLOAD,
        `upload the code currently in \`${DIR_DIST}\` onto the set branch ` +
        `(default: \`${DEFAULT_BRANCH}\`).` +
        `note: requires \`${FILE_SCREEPS_AUTH}\`.`,
        function()
        {
            log_verbose_config(grunt, this);
            
            try
            {
                grunt.task.requires(build_tasks);
            }
            catch (error)
            {
                if (grunt.config.get(CFGKEY_FORCE) || grunt.config.get(CFGKEY_DRY))
                {
                    grunt.log.writeln("[warning]: " + error.message);
                }
                else
                {
                    throw error;
                }
            }
            
            const options = this.options({ });
            grunt.log.writeln("will upload to: " + options.email + "/" + options.branch);
            
            if (grunt.config.get(CFGKEY_DRY))
            {
                grunt.log.writeln("dry run: did not upload.");
                return;
            }
            
            grunt.task.renameTask("screeps", TASK_UPLOAD);
            grunt.task.run(TASK_UPLOAD);
        });

    grunt.task.registerTask(
        TASK_DEPLOY,
        `\`build\` then \`upload\`. equivalent to: \`build branch:<branch> upload\`.`,
        function(branch)
        {
            let tasks = [ TASK_BUILD ];
            
            if (branch != null)
            {
                tasks.push(CFGTASK_BRANCH + ARG_DELIM + branch);
            }
            else
            {
                grunt.log.writeln(
                    "[warning] no branch specified,",
                    "will use default branch:", DEFAULT_BRANCH
                    );
            }
            tasks.push(TASK_UPLOAD);
            
            grunt.log.writeln("deploy will run tasks:", JSON.stringify(tasks));
            
            grunt.task.run(tasks);
        });
};
