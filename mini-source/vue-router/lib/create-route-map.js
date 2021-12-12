function addRouteRecord(routes, pathMap, parent) {
    routes.forEach((route) => {
        const { path, children, ...rest } = route;
        // 拼接子路由path
        const normalizedPath = parent ? parent.path + "/" + path : path;
        // 将parent也放入到属性中，方便之后生成matched数组
        pathMap[normalizedPath] = { ...rest, path: normalizedPath, parent };
        if (children) {
            // 继续遍历子路由
            addRouteRecord(children, pathMap, route);
        }
    });
}

export const createRouteMap = (routes, pathMap = {}) => {
    addRouteRecord(routes, pathMap);
    return pathMap;
};
