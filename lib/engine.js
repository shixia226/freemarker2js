const rpls = require('./replace');
const express = require('./express');

module.exports = {
    exp: function(exp) {
        var reg = /(['"]).*?\1/g,
            match, expString = [],
            from = 0;
        while ((match = reg.exec(exp))) {
            var to = match.index;
            expString.push(prefixExpress(exp.substring(from, to)), match[0]);
            from = to + match[0].length;
        }
        expString.push(prefixExpress(exp.substr(from)));
        exp = expString.join('');
        for (var i = 0, len = rpls.length; i < len; i += 2) {
            exp = exp.replace(rpls[i], rpls[i + 1]);
        }
        return '(' + exp + ')';
    },
    resolve: function(template) {
        var jsString = [];
        var block;
        var m = template.match(reg_block);
        if (m) {
            if (m[1]) {
                block = express[m[1]](template, m.index, this);
            } else if (m[2]) {
                block = {
                    start: m.index,
                    end: m.index + m[0].length,
                    output: this.exp(m[2])
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
        for (var i = jsString.length - 1; i >= 0; i--) {
            if (!jsString[i]) {
                jsString.splice(i, 1);
            }
        }
        return jsString.join('+');
    }
}

var reg_block = /(?:<#([\w]+)[\s])|(?:\$\{([^}]+)\})/,
    reg_blank = /(?:\s+)?[\r\n]+(?:\s+)?/g;

function formatString(str) {
    str = str.replace(reg_blank, '');
    return str ? JSON.stringify(str) : undefined;
}

var KEYS = ['true', 'false', 'gte', 'lte', 'gt', 'lt', 'eq'];

function prefixExpressReplace(exp, pre) {
    return !pre && KEYS.indexOf(exp) === -1 ? 'context.' + exp : exp;
}

function prefixExpress(exp) {
    return exp.replace(/([\?\.]\s*)*[a-zA-Z_][\.\w]*/g, prefixExpressReplace);
}