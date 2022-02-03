/** Parse an envfile string. */
function parse(src) {
    const result = {};
    const lines = src.toString().split('\n');
    for (const line of lines) {
        const match = line.match(/^([^=:#]+?)[=:](.*)/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            result[key] = value;
        }
    }
    return result;
}
/** Turn an object into an envfile string. */
function stringify(obj) {
    let result = '';
    for (const [key, value] of Object.entries(obj)) {
        if (key) {
            const line = `${key}=${String(value)}`;
            result += line + '\n';
        }
    }
    return result;
}

module.exports = {
    parse,
    stringify
}