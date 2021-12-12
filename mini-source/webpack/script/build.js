const webpack = require("../lib/webpack.js");
const config = require("../webpack.config.js");

const compiler = webpack(config);
compiler.run();
