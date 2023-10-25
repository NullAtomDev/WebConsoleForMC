const crypto = require("crypto");

let md5 = crypto.createHash('md5')
    .update('test')
    .digest('hex');
console.log(md5);
