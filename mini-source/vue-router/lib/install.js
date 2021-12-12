import RouterView from "./components/view";
import RouterLink from "./components/link";

// install中主要做两件事
// 1. 所有组件添加$router以及$route属性
// 2. 全局注册router-view以及router-link组件

export default function install(Vue) {
    Vue.mixin({
        beforeCreate() {
            const { router } = this.$options;
            if (router) {
                this._rootRouter = this;
                this.$router = router;
                Vue.util.defineReactive(
                    this,
                    "$route",
                    this.$router.history.current
                );
                router.init(this);
            } else {
                this._rootRouter = this.$parent && this.$parent._rootRouter;
                this.$router = this._rootRouter.$router;
                Object.defineProperty(this, "$route", {
                    get() {
                        return this._rootRouter.$route;
                    },
                });
            }
        },
    });

    Vue.component("RouterView", RouterView);
    Vue.component("RouterLink", RouterLink);
}
