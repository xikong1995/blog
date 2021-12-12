const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

class Compiler {
    constructor(config = {}) {
        this.config = config;
    }

    run() {
        const entry = this.config.entry;
        const entryModule = this.parse(entry);
        const graph = this.getGraph(entryModule);
        const bundle = this.genCode(entry, graph);
        const { path: dir, filename } = this.config.output;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(path.resolve(dir, filename), bundle);
    }

    parse(filename) {
        // 1.读取入口文件
        const content = fs.readFileSync(filename, "utf-8");
        // 2. 将文件内容解析成抽象语法树 AST
        const ast = parser.parse(content, {
            sourceType: "module",
        });
        // 3. 遍历AST抽象语法树
        const dependencies = {};
        const dirname = path.dirname(filename);
        traverse(ast, {
            //获取通过import引入的模块
            ImportDeclaration({ node }) {
                const newFile = path.resolve(dirname, node.source.value);
                //保存所依赖的模块
                dependencies[node.source.value] = newFile;
            },
        });
        // 4.通过@babel/core和@babel/preset-env进行代码的转换
        const { code } = babel.transformFromAst(ast, null, {
            presets: ["@babel/preset-env"],
        });

        return {
            filename, //该文件名
            dependencies, //该文件所依赖的模块集合(键值对存储)
            code, //转换后的代码
        };
    }

    getGraph(entryModule) {
        // 将入口模块及其所有相关的模块放入数组
        const graphArray = [entryModule];
        for (let i = 0; i < graphArray.length; i++) {
            const item = graphArray[i];
            const { dependencies } = item;
            for (let j in dependencies) {
                graphArray.push(this.parse(dependencies[j]));
            }
        }
        // 接下来生成图谱
        const graph = {};
        graphArray.forEach((item) => {
            graph[item.filename] = {
                dependencies: item.dependencies,
                code: item.code,
            };
        });
        return graph;
    }

    genCode(entry, graph) {
        graph = JSON.stringify(graph);

        return `
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

            require('${entry}')
        })(${graph})`;
    }
}

function webpack(config) {
    return new Compiler(config);
}

module.exports = webpack;
