let reg_num = /^\d+$/;

module.exports = {
    /**
     * assign赋值
     * 
     * @param {string} template ftl模板 
     * @param {int} start 相对的起始索引位置
     * @param {object} context 数据上下文
     * @param {object} globalCtx 全局数据上下文
     * @returns {
        start: 相对的起始索引位置,
        end: 相对的结束索引位置
        output: 解析后的HTML
    }
    */
    'assign': function(template, start) {
        let jsString = ['(function(context, global){'];
        let patt = /<#assign[\s]+([^\/>]+)[\s]*\/?>/g;
        let res = patt.exec(template);
        let content = res[1];
        // 这里要处理"value=obj.value", "value=obj.value=='key'?string('key1', 'key2')"及多个这样的表达式组成的一个
        let pattAssign = /\s*([^=\s]+)\s*=\s*([^=]+?(?:(?:>=|<=|==)[^=]+?)*)(?=(?:\s+\w+\s*=)|$)/g;
        while (true) {
            let execRes = pattAssign.exec(content);
            if (execRes) {
                jsString.push('global.', execRes[1], '=', engine.exp(execRes[2]), ';');
            } else {
                break;
            }
        }
        jsString.push('return ""})(context, global)');
        return {
            start: start,
            end: start + res[0].length,
            output: jsString.join('')
        };
    },
    'list': function(template) {
        let jsString = ['(function(context, global){ let strs = []; '];
        let patt = /(?:<#list +([\w\.\[\]]+) +as +(\w+) *>)|(<\/#list>)/g;
        let match = patt.exec(template);
        if (!match || match[3]) throw new Error('错误的list标签');
        let count = 1,
            start = match.index,
            startLabel = match[0],
            dataLabel = match[1],
            contextLabel = match[2];
        do {
            match = patt.exec(template);
            if (!match) throw new Error('错误的list标签');
            if (match[3]) {
                count--;
            } else {
                count++;
            }
        } while (count > 0);
        let end = match.index,
            subTemplate = template.substring(start + startLabel.length, end);
        let matchRepeat = /(.*[^.])+\.\.([^.].*)/.exec(dataLabel);
        if (matchRepeat) { //解析 <#list 1..item.count as idx>
            jsString.push('let arr = []; for (let i = ', (reg_num.test(matchRepeat[1]) ? '' : 'context.') + matchRepeat[1], ', len = ', (reg_num.test(matchRepeat[2]) ? '' : 'context.') + matchRepeat[2], '; i <= len; i++) { arr.push(i); }');
        } else {
            jsString.push('let arr = context.', dataLabel, ';');
        }
        jsString.push('for(let i = 0, len = arr ? arr.length : 0; i < len; i++) { ', 'context.', contextLabel, '_index = i;context.', contextLabel, ' = arr[i];strs.push(', engine.resolve(subTemplate), ')', '} return strs.join("") })(ftl.sub(context), global)');
        return {
            start: start,
            end: end + match[0].length,
            output: jsString.join('')
        };
    },
    'if': function(template, _, context, globalCtx) {
        let jsString = ['(function(context, global){ if('];
        let patt = /(?:<#if ([^>]+)>)|(?:<#elseif ([^>]+)>)|(<#else>)|(<\/#if>)/g;
        let match = patt.exec(template);
        if (!match || !match[1]) throw new Error('错误if标签');
        let count = 1,
            start = match.index,
            from = start + match[0].length;
        jsString.push(engine.exp(match[1]), '){');
        do {
            match = patt.exec(template);
            if (!match) throw new Error('错误的if标签');
            if (match[1]) {
                count++;
            } else if (match[2]) {
                if (count === 1) {
                    jsString.push('return ', engine.resolve(template.substring(from, match.index)), '} else if (', engine.exp(match[2]), ') {');
                    from = match.index + match[0].length;
                }
            } else if (match[3]) {
                if (count === 1) {
                    jsString.push('return ', engine.resolve(template.substring(from, match.index)), '} else {');
                    from = match.index + match[0].length;
                }
            } else if (match[4]) {
                count--;
            }
        } while (count > 0);
        let idx = jsString.length - 1;
        jsString.push('return ', engine.resolve(template.substring(from, match.index)), jsString[idx] === '} else {' ? '}' : '} return ""', ' })(context, global)');
        return {
            start: start,
            end: match.index + match[0].length,
            output: jsString.join('')
        };
    }
}