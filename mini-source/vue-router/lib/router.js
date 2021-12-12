import install from "./install";
import HashHistory from "./history/hash";
import { createMatcher } from "./create-matcher";

class VueRouter {
    constructor(options) {
        this.matcher = createMatcher(options.routes);
        this.history = new HashHistory(this);
        this.beforeEachs = [];
    }

    init(app) {
        // 第一次渲染时也需要手动执行一次onHashchange方法
        this.app = app;
        this.history.onHashchange();
        this.history.listenEvent();
    }

    push(path) {
        location.hash = path;
    }

    match(path) {
        return this.matcher.match(path);
    }

    beforeEach(fn) {
        this.beforeEachs.push(fn);
    }
}

VueRouter.install = install;

export default VueRouter;
