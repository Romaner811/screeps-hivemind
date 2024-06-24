// https://docs.screeps.com/commit.html

const { file } = require("grunt");
const path = require("path");


const BRANCH_DEV = "dev";
const BRANCH_MAIN = "default";
const DEFAULT_BRANCH = BRANCH_DEV;

const ARG_DELIM = ":";
// config flags // todo: grunt.option
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
const TASK_SCREEPS = "#___screeps___";
// master
const TASK_DEPLOY = "deploy";

const CFGKEY_DRY = "is_dry";
const CFGKEY_VERBOSE = "is_verbose";
const CFGKEY_FORCE = "force";
const CFGKEY_SCREEPS_BRANCH = TASK_UPLOAD + ".options.branch";
const CFGKEY_SCREEPS_AUTH = "secret.screeps.auth";

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


const DIR_CURRECT_WORKING = "./";
const FLAT_PATH_DELIM = "#";
const MODULE_MAIN = "index";
const REGEX_MODULE_PATH = /(?<=(?<quote>[\"\']))(?<dir>\.(?:\/[\w\.\-]+)*)\/(?<name>[\w\.\-]+)(?<ext>(?:\.c?js)?)(?=\k<quote>)/g;


class Screepsify
{
    /**
     * 
     * @param {string} source_root 
     * @param {string} dest_root 
     * @param {boolean} verbose 
     */
    constructor(source_root, dest_root, verbose)
    {
        this.source_root = path.posix.normalize(source_root);
        this.dest_root = path.posix.normalize(dest_root);
        
        this.verbose = (verbose == true);
        this.known_modules = new Set();
    }

    /**
     * strips the path from any non-identifying features.
     * @param {string} file_path f.e: `./dist/dir/subdir/index.js`
     * @returns {string} f.e: `dir/subdir`
     */
    extract_module_unique(file_path)
    {
        let module_path = file_path;

        module_path = path.posix.normalize(module_path);
        
        if (module_path.startsWith(this.dest_root))
        {
            module_path = path.posix.relative(this.dest_root, module_path);
        }
        else if (module_path.startsWith(this.source_root))
        {
            module_path = path.posix.relative(this.source_root, module_path);
        }

        let parsed = path.posix.parse(module_path);

        if (parsed.name == MODULE_MAIN)
        {
            module_path = parsed.dir;
        }
        else
        {
            module_path = path.posix.join(parsed.dir, parsed.name)
        }

        return module_path;
    }

    #combine_module_unique(context_path, module_path)
    {
        return path.posix.join(context_path, module_path);
    }

    #convert_module_unique(combined_module_unique)
    {
        return combined_module_unique.replaceAll(path.posix.sep, FLAT_PATH_DELIM);
    }

    #make_dest_file_path(converted_module_unique)
    {
        return path.posix.join(
            this.dest_root, converted_module_unique + ".js"
            );
    }

    #make_module_path(converted_module_unique)
    {
        return DIR_CURRECT_WORKING + converted_module_unique;
    }

    //  "./src/dir/subdir/index.cjs"
    //  vvv
    //  "./dist/dir__subdir.js"
    
    //  @./*:
    //  require("./dir/subdir/index.cjs");
    //  require("./dir/subdir/index");
    //  require("./dir/subdir");
    //  @./dir/*:
    //  require("./subdir/index.cjs");
    //  require("./subdir/index");
    //  require("./subdir");
    //  @./dir/subdir/*:
    //  require("./index");
    //  require("./index.cjs");
    //  vvv
    //  @./*:
    //  require("./dir__subdir");

    //  "./src/dir/subdir/file_two.cjs"
    //  vvv
    //  "./dist/dir__subdir__file_two.js"
    
    //  require("./dir/subdir/file_two.cjs");
    //  require("./file_two.cjs");
    //  vvv
    //  require("./dir__subdir__file_two");

    /**
     * get familiar with all those dest files as modules.
     * @param {string[]} dest_files 
     */
    load_modules(dest_files)
    {
        for (const file_path of dest_files)
        {
            this.known_modules.add(this.extract_module_unique(file_path));
        }
        
        if (this.verbose)
        {
            console.log("known modules:", this.known_modules);
        }
    }
    
    /**
     * replaces all known modules to their converted variants.
     * @param {string} source_file 
     * @param {string} code 
     * @returns {{ dest_file: string, code: string }}
     */
    convert(source_file, code)
    {
        let context_unique = "";
        let context_dir = path.posix.dirname(source_file) + path.posix.sep;
        
        if (
            (context_dir != this.source_root) &&
            (context_dir != this.dest_root)
        )
        {
            context_unique = this.extract_module_unique(context_dir);
        }

        let converted = { };

        converted.dest_file = this.#make_dest_file_path(
            this.#convert_module_unique(
                this.extract_module_unique(source_file)
                )
            );
        
        let done = new Set();
        converted.code = code;
        for (const [ match ] of code.matchAll(REGEX_MODULE_PATH))
        {
            let module_unique = this.extract_module_unique(match);
            module_unique = this.#combine_module_unique(context_unique, module_unique);
            
            if (done.has(match)) continue; // already replaced
            
            if (this.known_modules.has(module_unique) == false)
            {
                if (this.verbose)
                {
                    console.log(`${source_file}: skipped ${module_unique}`);
                }
                // skip paths that are irrelevant or already replaced.
                continue;
            }

            let converted_match = this.#convert_module_unique(module_unique);
            converted_match = this.#make_module_path(converted_match);

            converted.code = converted.code.replace(match, converted_match);
            if (this.verbose)
            {
                console.log(`${source_file}: ${match} -> ${converted_match}`);
            }

            done.add(match);
        }

        return converted;
    }
}


module.exports = function(grunt) {
    grunt.config.init({
        // settings
        [CFGKEY_DRY]: false,
        [CFGKEY_VERBOSE]: false,
        [CFGKEY_FORCE]: false,
        // tasks
        [TASK_SCREEPSIFY]: {
            options: {
                src: DIR_SOURCE,
                dest: DIR_SCREEPSIFIED_CODE
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
        "config flag, dont produce any side effcts.",
        function()
        {
            grunt.config.set(CFGKEY_DRY, true);
        });

    grunt.task.registerTask(
        CFGTASK_VERBOSE,
        "config flag, make all tasks be verbose.",
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
        "    - update \`require()\`s in all files.`",
        function()
        {
            log_verbose_config(grunt, this);

            const options = this.options();

            grunt.file.delete(options.dest);

            const helper = new Screepsify(
                options.src,
                options.dest,
                grunt.config.get(CFGKEY_VERBOSE)
            );

            const source_files = [ ];
            grunt.file.recurse(
                options.src,
                function(abspath, rootdir, subdir, filename) {
                    source_files.push(abspath);
                }
                );

            helper.load_modules(source_files);

            const is_dry = grunt.config.get(CFGKEY_DRY);

            for (const source_file of source_files)
            {
                let code = grunt.file.read(source_file);
                
                let converted = helper.convert(source_file, code);

                if (is_dry != true)
                {
                    grunt.file.write(converted.dest_file, converted.code);
                }
                
                grunt.log.writeln(`${source_file}: written to ${converted.dest_file}`);
                if (helper.verbose)
                {
                    grunt.log.writeln("");
                }
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
    grunt.task.renameTask("screeps", TASK_SCREEPS);
    grunt.task.registerTask(
        TASK_UPLOAD,
        `upload the code currently in \`${DIR_DIST}\` onto the set branch ` +
        `(default: \`${DEFAULT_BRANCH}\`).\n` +
        `note: use this instead of \`${TASK_SCREEPS}\` task.\n` +
        `also note: requires \`${FILE_SCREEPS_AUTH}\`.`,
        function()
        {
            grunt.config.set(
                CFGKEY_SCREEPS_AUTH,
                grunt.file.readJSON(FILE_SCREEPS_AUTH)
                );

            log_verbose_config(grunt, this);
            
            try
            {
                grunt.task.requires(TASK_BUILD, ...build_tasks);
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
            
            grunt.task.renameTask(TASK_SCREEPS, TASK_UPLOAD);
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
