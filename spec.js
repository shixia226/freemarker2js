var freemarker = require('./index');

freemarker(`<a <#if link??>href="\${link}"</#if>>
<div class="marker-address">\${address}</div>
<div class="marker-pop">
    <div class="detail">
        <p class="address">\${address}</p>
        <span class="info">\${detail!''}</span>
    </div>
    <div class="price">\${price}</div>
</div>
</a>`)