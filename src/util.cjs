/** @module */


/**
 * @class
 * @extends Error
 */
class NotImplementedError extends Error
{
    constructor()
    {
        super("not implemented");
    }
}

/**
 * 
 * @param {RoomPosition} pos 
 * @returns {string} 
 */
function pos_stringify(pos)
{
    return `${pos.roomName}(${pos.x},${pos.y})`;
}

const RE_POS = /(?<room>[\w]+)\((?<x>-?\d),(?<y>-?\d)\)/;
/**
 * 
 * @param {string} txt_pos 
 * @returns {RoomPosition}
 */
function pos_parse(txt_pos)
{
    let pos_match = txt_pos.match(RE_POS);
    if (pos_match == null) return null;

    return new RoomPosition(pos_match["x"], pos_match["y"], pos_match["room"]);
}


/**
 * 
 * @param {Array} arr 
 * @param {number} idx 
 */
function arr_remove_at(arr, idx)
{
    arr.splice(idx, 1);
}

/**
 * 
 * @template T
 * @param {Array<T>} arr 
 * @param {T} item
 */
function arr_remove(arr, item)
{
    const idx = arr.indexOf(item);
    if (idx < 0) return false;
    
    arr.splice(idx, 1);
    return true;
}

/**
 * 
 * @template T
 * @param {Array<T>} arr 
 * @param {number} idx 
 * @param {...T} items
 */
function arr_insert(arr, idx, ...items)
{
    arr.splice(idx, 0, ...items);
}


module.exports = {
    NotImplementedError,
    
    pos_stringify,
    pos_parse,

    arr_remove_at,
    arr_remove,
    arr_insert
};
