export function has(target, key) {
    return target && target.hasOwnProperty(key);
};

export function eachArray (target, callback, context) {
    for (let i = 0, len = target.length; i < len; i += 1) {
        const result = callback.call(context || null, target[i], i, target);

        if (result === false) {
            return;
        }
    }
};

export function eachDict (target, callback, context) {
    const keys = target ? Object.keys(target) : [];

    eachArray(keys, (key) => {
        return callback.call(context || null, key, target[key], target);
    });
};