
const subdir = require("./dir#subdir");

function func_one()
{
    console.log("./dir/file");
    subdir.func_two();
}

module.exports = {
    func_one
};
