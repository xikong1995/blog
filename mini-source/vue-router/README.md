# vue-router

单页应用的路由和传统页面的路由是有很多区别的。

单页应用路由改变后，页面并没有刷新，也不会向服务端发起请求，获取新页面的数据。

单页应用页面的切换本质是组件的切换，根据 URI 的不同，渲染不同的组件。

## hash

如果要实现 URI 改变，但页面不刷新，一种方式就是利用 hash。

如下面这样的地址：

`http://127.0.0.1:8080/#/bar`

这种包含 hash （即#号和后面字符串）的地址，可以只改变地址，而不刷新页面。简单来说，就是地址栏的地址可以表明一种状态，页面不用刷新就可以根据这种状态呈现不同的内容。

-   通过 location 对象的 hash 属性，我们可以获取当前页面的哈希串。
-   通过监听 window 对象的 hashchange 事件，我们可以捕获到地址的变化。

## history 对象

除了这种 hash 地址，HTML5 也提供了一种新的方式达到同样的效果，那就是 history 对象。这种新方式可以不包含 # 号，和正常的地址一样。

history 对象有如下方法：

-   forward()
-   back()
-   go()
-   pushState()
-   popState()

通过监听 window 对象的 popstate 事件，我们可以捕获到地址的变化。

**注意：** 前三个方法可以触发 popstate 事件，但是后面两个方法不可以。

更多关于 history 对象[点击这里](https://developer.mozilla.org/zh-CN/docs/Web/API/History)了解
