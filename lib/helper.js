module.exports = {
    sub: function(context) {
        let f = function() {};
        f.prototype = context;
        return new f();
    },
    args: function(html, context) {
        let match, args = context._args = {};
        while ((match = (reg_data_args.exec(html)))) {
            args[match[1]] = match[2];
        }
    },
    formatDate: function(date, fmt) {
        date = new Date(/^\d+$/.test(date) ? parseInt(date) : date);
        return fmt.replace('yyyy', date.getFullYear())
            .replace('yy', date.getFullYear() % 100)
            .replace('MMM', MONTHS[date.getMonth()])
            .replace('MM', (date.getMonth() + 1).toString().padEnd(2, '0'))
            .replace('dd', date.getDate().toString().padEnd(2, '0'))
            .replace('HH', date.getHours().toString().padEnd(2, '0'))
            .replace('mm', date.getMinutes().toString().padEnd(2, '0'))
            .replace('ss', date.getSeconds().toString().padEnd(2, '0'));
    },
    formatNumber: function(num, fmt) {
        if (!fmt) return num.toString();
        let percentCount = 0;
        if (fmt.charAt(fmt.length - 1) === '%') {
            num = 100 * num;
            percentCount = 1;
        }
        let idx = fmt.indexOf('.');
        if (idx !== -1) {
            let floatStr = fmt.substr(idx + 1),
                len = floatStr.length - percentCount;
            num = parseFloat(num).toFixed(len);
            let nidx = floatStr.indexOf('#');
            if (nidx !== -1) num = num.replace(new RegExp('\\.?0{1,' + (len - nidx) + '}$'), '');
        } else {
            num = parseInt(num);
        }
        if (fmt.charAt(0) === ',') {
            let count = (idx === -1 ? num.length : idx) - 1;
            num = ('' + num).replace(new RegExp('\\d{1,' + count + '}(?=\\d{' + count + '}(?:\\.|$))'), '$&,');
        }
        return num + (percentCount === 1 ? '%' : '');
    }
};

let reg_data_args = /\s+data-([^=]+)="([^"]+)"/g,
    MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];