const engine = require('./engine');

module.exports = function(template) {
    var jsString = formatTemplate(template);
    jsString = jsString.replace(reg_empty_func, replaceEmptyFunc);
    if (arguments[1] === true) {
        return new Function('context', 'global', toString(require('freemarker2js-base')) + jsString);
    }
    return 'function(context, global) {var ftl = require(\'freemarker2js-base\');' + jsString + '}';
};

var reg_empty_func = /((?:.(?!function))+)return ""}\)\(context, global\)\+\(function\(context, global\){/g,
    ftlString;

function replaceEmptyFunc($0, $1) {
    return ($1.indexOf('return ') !== -1) ? $0 : $1;
}

var formatTemplate = function(template) {
    var reg = /(<[#!]--)|(-->)/g,
        from = -1,
        idx = [],
        count = 0;
    do {
        var match = reg.exec(template);
        if (!match) break;
        if (match[1]) {
            count++;
            if (from === -1) from = match.index;
        } else if (match[2]) {
            if ((--count) === 0) {
                idx.push(from, match.index + match[0].length);
                from = -1;
            }
        }
    } while (true);
    var str = [],
        to = template.length;
    if (count > 0) idx.push(from, to);
    for (var i = idx.length - 1; i >= 0; i--) {
        str.unshift(template.substring(idx[i], to));
        to = idx[--i];
    }
    str.unshift(template.substring(0, to));
    return 'context=context||{};global=global||context; return ' + engine.resolve(str.join(''));
};

function toString(ftl) {
    var json = ['var ftl = {'];
    for (var name in ftl) {
        if (ftl.hasOwnProperty(name)) {
            json.push(name, ':', ftl[name].toString(), ',');
        }
    }
    json.pop();
    json.push('};');
    return json.join('');
}