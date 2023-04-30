var ghpages = require("gh-pages");
var fs = require("fs");

fs.openSync("out/.nojekyll", "w");

ghpages.publish("out", { dotfiles: true });
