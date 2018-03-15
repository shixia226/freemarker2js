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
    reg_num = /^(['"])[0#\.]*\1$/,
    reg_fmt = /^(['"])((?!\1).)+\1$/;

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
    var value = prefix.substr(idx + 1);
    fmt = fmt.trim();
    if (reg_num.test(fmt = fmt.trim())) { //格式化数字
        fmt = 'ftl.number(' + value + ',' + fmt + ')';
    } else if (reg_fmt.test(fmt)) { //格式化时间
        fmt = 'ftl.date(' + value + ',' + fmt + ')';
    } else {
        var spt = fmt.split(','),
            len = spt.length;
        if (len !== 2) {
            var quotChar;
            for (var i = 0; i < len; i++) {
                var str = spt[i];
                for (var k = 0, klen = str.length; k < klen; k++) {
                    var char = str.charAt(k);
                    if (reg_quot.test(char)) {
                        if (!quotChar) {
                            quotChar = char;
                        } else if (quotChar === char) {
                            quotChar = null;
                        }
                    } else if (char === '\\') {
                        k++;
                    }
                }
                if (!quotChar) {
                    spt[0] = spt.slice(0, i + 1).join(',');
                    spt[1] = spt.slice(i + 1).join(',');
                    break;
                }
            }
        }
        fmt = value + '?' + spt[0] + ':' + spt[1];
    }
    return prefix.substr(0, idx + 1) + fmt;
}