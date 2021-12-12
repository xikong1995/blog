# virtual-scroll

虚拟滚动是对长列表、大数据的一种优化处理。主要解决 Web 上 DOM 渲染性能问题，当 DOM 过多时，浏览器就会出现卡顿甚至崩溃现象。

虚拟滚动的原理就是只呈现可视区域的 DOM 元素，其它不在可视区域的 DOM 元素将被移除，减少内存和渲染的损耗。

虚拟滚动一般分为两种：

1. 子项定高
2. 子项不定高

子项不定高也可以分为两种：

1. 预先知道子项高度
2. 预先不知道子项高度

## 定高虚拟滚动实现

定高这种情况实现比较简单。

在该实现中，需要确定几个关键数据：

1. 可视区域高度：visibleHeight
2. 滚动条高度：scrollTop
3. 可视区域显示元素个数：count = Math.ceil(visibleHeight / itemHeight)
4. 可视元素起始索引：startIndex = Math.floor(scrollTop / itemHeight)
5. 可视元素结束索引：endIndex = startIndex + count
6. 可视元素列表：visibleData = data.slice(startIndex, endIndex)
7. 总元素高度：`itemHeight * itemCount`

## 不定高虚拟滚动实现

不定高度较为复杂，需要多一点计算。

**预先知道子项高度**

和定高的最大不同点，就是如果确定 startIndex 和 endIndex。

如果我们知道每一个子项其上边界和下边界距离容器顶部的高度，那么就可以很容易的求出 startIndex 和 endIndex。

```
itemPosition: {
    top: number
    bottom: number
    height: number
    index: number
}
```

当 `itemPosition.bottom > scrollTop`，如果其 bottom 是满足条件的元素中最小的，那么 startIndex = 其 index。

当 `itemPosition.top > scrollTop + visibleHeight`，如果其 top 是满足条件的元素中最小的，那么 endIndex = 其 index。

**预先不知道子项高度**

如果预先不知道子项的高度，我们需要在其渲染到界面后，进行计算。

利用 `dom.getBoundingClientRect()` 和 `scrollTop`，可以很容易的算出 itemPosition。

还有一种比较复杂的情况，子项可能在渲染后，因为和用户的交互，导致其高度发生变化。

所以，我们还需要监听每一个元素，以便在其高度变化后，进行 itemPosition 的更新。

利用 [MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)，可以很容易监听每一个 DOM 的变化。

鉴于很多人对该 API 不熟悉，下面给出一个示例：

```js
// 选择需要观察变动的节点
const targetNode = document.getElementById("some-id");

// 观察器的配置（需要观察什么变动）
const config = { attributes: true, childList: true, subtree: true };

// 当观察到变动时执行的回调函数
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
            console.log("A child node has been added or removed.");
        } else if (mutation.type === "attributes") {
            console.log(
                "The " + mutation.attributeName + " attribute was modified."
            );
        }
    }
};

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback);

// 以上述配置开始观察目标节点
observer.observe(targetNode, config);

// 之后，可停止观察
observer.disconnect();
```
