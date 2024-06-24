
const dir = require("./dir");
// const file = require("./file");  // test replacing more than one style of the same request
const file = require("./file");

module.exports.loop = function()
{
    file.func();
    dir.func_one();
    dir.func_two();
}
