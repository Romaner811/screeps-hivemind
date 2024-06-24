const process = require("process");
const path = require("path");
const fs = require("fs");
const { execSync, exec } = require("child_process");

// run: node test/screepsify/test.js

const DIR_TMP = "tmp/";
const DIR_SRC = "src/";
const DIR_DIST = "dist/";
const FILE_GRUNT = "Gruntfile.js";


function convert_to_posix_path(win_path)
{
    let win_parsed = path.parse(win_path);

    let posix_root = ".";
    if (win_parsed.root != "")
    {
        posix_root = path.posix.sep;
        posix_root += win_parsed.root
            .replace(path.sep, "")
            .replace(":", "")
            .toLowerCase()
            ;
    }
    let path_parts = win_parsed.dir
        .replace(win_parsed.root, "")
        .split(path.sep);

    return path.posix.join(posix_root, ...path_parts, win_parsed.base);
}


class Test
{
    prepare() { }
    run() { }
    cleanup() { }
}


class ScreepsifyTest extends Test
{
    constructor()
    {
        super();

        this.test_root = convert_to_posix_path(path.relative(process.cwd(), __dirname));

        this.dir_test_env = path.posix.join(this.test_root, DIR_TMP);
        this.dir_template_src = path.posix.join(this.test_root, DIR_SRC);
        this.dir_test_src = path.posix.join(this.dir_test_env, DIR_SRC);
        this.dir_expected_dist = path.posix.join(this.test_root, DIR_DIST);
        this.dir_test_dist = path.posix.join(this.dir_test_env, DIR_DIST);
    }

    get cmd_grunt_screepsify()
    {
        return `grunt --stack --base="${this.dir_test_env}" verbose screepsify`;
    }

    get cmd_diff()
    {
        return "diff --recursive --minimal --text --ignore-space-change " +
            `\"${this.dir_expected_dist}\" \"${this.dir_test_dist}\"`;
    }

    #run_cmd(cmd)
    {
        console.log(`exec: $ ${cmd}`);
        console.log("");
        execSync(cmd, {stdio: 'inherit'});
        console.log("");
    }
    
    prepare()
    {
        console.assert(
            fs.existsSync(FILE_GRUNT),
            `must be run from project root, where the ${FILE_GRUNT} is.`
            );
        
        console.log(`copying... ${this.dir_template_src} -> ${this.dir_test_src}`);
        fs.cpSync(this.dir_template_src, this.dir_test_src, { recursive: true });
    }

    run()
    {
        try
        {
            this.#run_cmd(this.cmd_grunt_screepsify);
        }
        catch (error)
        {
            console.assert(false, `grunt failed: ${error.status}`);
        }
        
        try
        {
            this.#run_cmd(this.cmd_diff);
        }
        catch (error)
        {
            console.assert(false, `diff: ${error.status} -> differences found.`);
        }
    }

    cleanup()
    {
        if (fs.existsSync(this.dir_test_env))
        {
            console.log(`deleting... ${this.dir_test_env}`);
            fs.rmdirSync(this.dir_test_env, { recursive: true });
        }
    }

}


/**
 * 
 * @param {Test} test 
 */
function perform_test(test)
{
    console.log(`Performing: ${test.constructor.name}`);
    console.log("");

    try
    {
        console.log("preparing...");
        test.prepare();
        console.log("");

        console.log("running...");
        test.run();
        console.log("");
    }
    catch (error)
    {
        console.error(error);
        console.log("");
        console.log("FAIL");
        console.log("");
        return false;
    }
    finally
    {
        console.log("cleanup...");
        //#>test.cleanup();
        console.log("");
    }

    console.log("");
    console.log("PASS");
    console.log("");
    return true;
}

function main()
{
    perform_test(new ScreepsifyTest());
}

if (require.main === module)
{
    main();
}
