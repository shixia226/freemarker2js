const rpls = require('./replace');
const express = require('./express');

module.exports = {
    exp: function(exp) {
        let reg = /['"][^'"]*['"]/g,
            match, expString = [],
            from = 0;
        while ((match = reg.exec(exp))) {
            let to = match.index;
            expString.push(prefixExpress(exp.substring(from, to)), match[0]);
            from = to + match[0].length;
        }
        expString.push(prefixExpress(exp.substr(from)));
        exp = expString.join('');
        for (let i = 0, len = rpls.length; i < len; i += 2) {
            exp = exp.replace(rpls[i], rpls[i + 1]);
        }
        return '(' + exp + ')';
    },
    resolve: function(template) {
        let jsString = [];
        let block;
        let m = template.match(reg_block);
        if (m) {
            if (m[1]) {
                block = express[m[1]](template, m.index);
            } else if (m[2]) {
                block = {
                    start: m.index,
                    end: m.index + m[0].length,
                    output: engine.exp(m[2])
                };
            }
        }
        if (block) {
            jsString.push(
                formatString(template.substr(0, block.start)),
                block.output,
                this.resolve(template.substr(block.end))
            );
        } else {
            jsString.push(formatString(template));
        }
        for (let i = jsString.length - 1; i >= 0; i--) {
            if (!jsString[i]) {
                jsString.splice(i, 1);
            }
        }
        return jsString.join('+');
    }
}

let reg_block = /(?:<#([\w]+)[\s])|(?:\$\{([^}]+)\})/,
    reg_blank = /(?:\s+)?[\r\n]+(?:\s+)?/g;

function formatString(str) {
    str = str.replace(reg_blank, '');
    return str ? JSON.stringify(str) : undefined;
}

let KEYS = ['true', 'false', 'gte', 'lte', 'gt', 'lt', 'eq'];

function prefixExpressReplace(exp, pre) {
    return !pre && KEYS.indexOf(exp) === -1 ? 'context.' + exp : exp;
}

function prefixExpress(exp) {
    return exp.replace(/([\?\.]\s*)*[a-zA-Z_][\.\w]+/g, prefixExpressReplace);
}