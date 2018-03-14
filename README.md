# freemarker2js

Freemarker integration for Web

## Install

  - `npm install freemarker2js --save-dev`

## How to use

#### Build javascript
```javascript
const freemarker = require('freemarker2js');
let template = freemarker('<h1>${title}</h1>');

/*output
function(context, global) {
    var global = (context = context || {});
    return "<h1>" + (context.title) + "</h1>"
}
*/
console.log(template);

template = freemarker('<h1>${title}</h1>', false);

/*output
var global = (context = context || {});
return "<h1>" + (context.title) + "</h1>"
*/
console.log(template);
```
*NOTICE: variable ```template``` is a string type

#### Render string
```javascript
const freemarker = require('freemarker2js');
const template = freemarker('<h1>${title}</h1>', true);

//output '<h1>test render</h1>'
console.log(template({ title: 'test render' }));
```

## LICENSE
MIT
