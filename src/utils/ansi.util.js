const { parse } = require ('ansicolor')

const convertAnsiToCss = (logLine) => {
    const parsed = parse(logLine);
    const spans =  parsed.spans.map((span) => {
        return span.css? `<span style="${span.css}">${span.text}</span>`: `<span>${span.text}</span>`
    })
    return spans.join('')
}

module.exports = {
    convertAnsiToCss
}