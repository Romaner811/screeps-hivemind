
const dir = require("./dir");
const file = require("./file.cjs");

module.exports.loop = function()
{
    file.func();
    dir.func_one();
    dir.func_two();
}
