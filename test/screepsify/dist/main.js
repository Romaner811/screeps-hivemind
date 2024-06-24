
const dir = require("./dir");
const file = require("./file");

module.exports.loop = function()
{
    file.func();
    dir.func_one();
    dir.func_two();
}
