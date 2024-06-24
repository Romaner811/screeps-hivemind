
const subdir = require("./subdir");

function func_one()
{
    console.log("./dir/file");
    subdir.func_two();
}

module.exports = {
    func_one
};
