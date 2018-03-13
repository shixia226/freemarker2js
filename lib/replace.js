module.exports = [
    /[\s]gte[\s]/g, ' >= ',
    /[\s]lte[\s]/g, ' <= ',
    /[\s]gt[\s]/g, ' > ',
    /[\s]lt[\s]/g, ' < ',
    /[\s]eq[\s]/g, ' === ',
    /([^\s!]+)\!((['"]).*\3)/, '($1!=undefined&&$1!=null?$1:$2)',
    /([^\s!]+)\?default\(((['"]).*\3)\)/, '($1!=undefined&&$1!=null?$1:$2)',
    /([^?]+)\? *string\(([^)]+)\)/g, ftl_toString,
    /\?size/g, '.length',
    /\?(replace\([^)]+\))/g, '.$1',
    /\?substring\(([^()]+)\)/g, '.substring($1)',
    /\?upper_case/g, '.toUpperCase()',
    /\?lower_case/g, '.toLowerCase()',
    /([^\s!\(\)]+)\?if_exists/, '($1!=undefined&&$1!=null?$1:"")',
    /([^\s!\(\)\?]+)\?(?:\?|exists)/g, '($1!=undefined&&$1!=null)'
];

var reg_name_unchar = /[^\._$a-zA-Z0-9]/,
    reg_quot = /['"]/,
    reg_dot_split = /([^,]+?) *, *([^,]+)/;

function ftl_toString(_, prefix, fmt) {
    var idx = prefix.length - 1,
        bracket = 0;
    while (idx >= 0) {
        var pchar = prefix.charAt(idx);
        if (pchar === ')') {
            bracket++;
        } else if (pchar === '(') {
            if (bracket === 1) {
                idx--;
                break;
            }
            bracket--;
        } else if (bracket === 0 && reg_name_unchar.test(pchar)) {
            break;
        }
        idx--;
    }
    fmt = fmt.trim();
    var value = prefix.substr(idx + 1),
        match = fmt.match(reg_dot_split);
    if (match) {
        var preMatch = match[1];
        if (!reg_quot.test(preMatch.charAt(0)) || reg_quot.test(preMatch.charAt(preMatch.length - 1))) {
            fmt = value + '?' + preMatch + ':' + match[2];
        } else {
            fmt = 'ftl.date(' + value + ',' + fmt + ')';
        }
    } else {
        fmt = 'ftl.number(' + value + ',' + fmt + ')';
    }
    return prefix.substr(0, idx) + fmt;
}