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
    'assign': function(template, start, engine) {
        var jsString = ['(function(context, global){'];
        var res = template.match(reg_assign);
        var content = res[1],
            reg_assign_exp = /\s*([^=\s]+)\s*=\s*([^=]+?(?:(?:>=|<=|==)[^=]+?)*)(?=(?:\s+\w+\s*=)|$)/g;
        // 这里要处理"value=obj.value", "value=obj.value=='key'?string('key1', 'key2')"及多个这样的表达式组成的一个
        while (true) {
            var execRes = reg_assign_exp.exec(content);
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
    'list': function(template, _, engine) {
        var reg_list = /(?:<#list +([\w\.\[\]]+) +as +(\w+) *>)|(<\/#list>)/g;
        var jsString = ['(function(context, global){ var strs = []; '];
        var match = reg_list.exec(template);
        if (!match || match[3]) throw new Error('错误的list标签');
        var count = 1,
            start = match.index,
            startLabel = match[0],
            dataLabel = match[1],
            contextLabel = match[2];
        do {
            match = reg_list.exec(template);
            if (!match) throw new Error('错误的list标签');
            if (match[3]) {
                count--;
            } else {
                count++;
            }
        } while (count > 0);
        var end = match.index,
            subTemplate = template.substring(start + startLabel.length, end);
        var matchRepeat = dataLabel.split('..');
        console.log(matchRepeat)
        if (matchRepeat.length === 2) { //解析 <#list 1..item.count as idx>
            jsString.push('var arr = []; for (var i = ', (reg_num.test(matchRepeat[0]) ? '' : 'context.') + matchRepeat[0], ', len = ', (reg_num.test(matchRepeat[1]) ? '' : 'context.') + matchRepeat[1], '; i <= len; i++) { arr.push(i); }');
        } else {
            jsString.push('var arr = context.', dataLabel, ';');
        }
        jsString.push('for(var i = 0, len = arr ? arr.length : 0; i < len; i++) { ', 'context.', contextLabel, '_index = i;context.', contextLabel, ' = arr[i];strs.push(', engine.resolve(subTemplate), ')', '} return strs.join("") })(ftl.sub(context), global)');
        return {
            start: start,
            end: end + match[0].length,
            output: jsString.join('')
        };
    },
    'if': function(template, _, engine) {
        var reg_if = /(?:<#if ([^>]+)>)|(?:<#elseif ([^>]+)>)|(<#else>)|(<\/#if>)/g;
        var jsString = ['(function(context, global){ if('];
        var match = reg_if.exec(template);
        if (!match || !match[1]) throw new Error('错误if标签');
        var count = 1,
            start = match.index,
            from = start + match[0].length;
        jsString.push(engine.exp(match[1]), '){');
        do {
            match = reg_if.exec(template);
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
        var idx = jsString.length - 1;
        jsString.push('return ', engine.resolve(template.substring(from, match.index)), jsString[idx] === '} else {' ? '}' : '} return ""', ' })(context, global)');
        return {
            start: start,
            end: match.index + match[0].length,
            output: jsString.join('')
        };
    }
}
var reg_num = /^\d+$/,
    reg_assign = /<#assign[\s]+(.+?)\/?>/;