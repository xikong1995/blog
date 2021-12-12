
        (function(graph) {
            //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
            function require(module) {
                //localRequire的本质是拿到依赖包的exports变量
                function localRequire(relativePath) {
                    return require(graph[module].dependencies[relativePath]);
                }
               
                var exports = {};
                
                (function(require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);

                //函数返回指向局部变量，形成闭包，exports变量在函数执行后不会被摧毁
                return exports;
            }

            require('./src/index.js')
        })({"./src/index.js":{"dependencies":{"./message.js":"/Users/zhoulei/Workplace/source/webpack/src/message.js"},"code":"\"use strict\";\n\nvar _message = _interopRequireDefault(require(\"./message.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\n//index.js\nconsole.log(_message[\"default\"]);"},"/Users/zhoulei/Workplace/source/webpack/src/message.js":{"dependencies":{"./word.js":"/Users/zhoulei/Workplace/source/webpack/src/word.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _word = require(\"./word.js\");\n\n//message.js\nvar message = \"say \".concat(_word.word);\nvar _default = message;\nexports[\"default\"] = _default;"},"/Users/zhoulei/Workplace/source/webpack/src/word.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\n//word.js\nvar word = \"hello\";\nexports.word = word;"}})