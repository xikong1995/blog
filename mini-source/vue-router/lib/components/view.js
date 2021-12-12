export default {
    name: "RouterView",
    render(h) {
        // 记录组件的深度，默认为0
        let depth = 0;
        const route = this.$parent.$route;
        let parent = this.$parent;
        // 递归查找父组件，如果父组件是RouterView组件，深度++
        // 最终的深度即为路由的嵌套层数
        while (parent) {
            if (parent.$options.name === "RouterView") {
                depth++;
            }
            parent = parent.$parent;
        }
        // 根据深度从matched中找到对应的记录
        const record = route.matched[depth];
        if (record) {
            return h(record.component);
        } else {
            return h();
        }
    },
};
