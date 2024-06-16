/** @module */


class NotImplementedError extends Error
{
    constructor()
    {
        super("not implemented");
    }
}


function pos_describe(pos)
{
    return `${pos.room.name}(${pos.x},${pos.y})`;
}


function arr_remove_at(arr, idx)
{
    arr.splice(idx, 1);
}
    
function arr_remove(arr, item)
{
    const idx = arr.indexOf(item);
    if (idx < 0) return false;
    
    arr.splice(idx, 1);
    return true;
}

function arr_insert(arr, idx, ...items)
{
    arr.splice(idx, 0, ...items);
}


module.exports = {
    NotImplementedError,
    
    pos_describe,

    arr_remove_at,
    arr_remove,
    arr_insert
};
