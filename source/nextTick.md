# 前言
为什么要写一篇关于 nextTick 的源码分析呢？

主要是因为 nextTick 与 JS 的事件循环（Event Loop）有关，这块知识还是比较重要的，尤其当我们的程序复杂了，很可能就会遇到因为 JS 顺序导致的问题。

**本文基于 2.6.11 版本的代码进行分析。**

# 事件循环
JS 执行是单线程的，它是基于事件循环的。事件循环大致分为以下几个步骤：
1. 所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。
2. 主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
3. 一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
4. 主线程不断重复上面的第三步。

其中异步任务又分为宏任务（macro task）和微任务（micro task），在浏览器环境：
- 宏任务
	- script 标签中的代码
	- setTimeout
	- setInterval
	- setImmediate
	- [MessageChannel](https://www.jianshu.com/p/4f07ef18b5d7)
	- I/O
	- UI 交互事件
	- requestAnimationFrame
- 微任务
   - Promise.then
   - MutationObsever

> Node.js 和这个有些不同，这里不展开说明了，感兴趣可以[参考这里](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)。

1. 程序开始执行时，执行栈中没有任务。
2. 微任务队列也没有任务，我们平时写的 script 中的代码算作宏任务，所以主线程就会从宏任务队列中取出`一个任务`放到执行栈中进行执行。
3. 在执行栈中的代码执行完后，就会从微任务队列中取出`所有任务`放到执行栈中进行执行。

至此，一次事件循环就结束了，接下来继续循环上面的步骤。循环逻辑用代码表示如下：

```javascript
for (macroTask of macroTaskQueue) {
    // 1. Handle current MACRO-TASK
    handleMacroTask();
      
    // 2. Handle all MICRO-TASK
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
}
```

# nextTick 语法
我们先来看下 nextTick 的语法与介绍。

```js
vm.$nextTick( [callback] )
```

将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 Vue.nextTick 一样，不同的是回调的 this 自动绑定到调用它的实例上。

这里注意，`Vue 实例`和`构造函数`上都有 nextTick 方法。

> 什么情况下，我们会用到 nextTick 方法呢？

理想情况，我们改变了 Vue 中的数据状态，对应的 DOM 视图应该刷新。但是，Vue 中并没有这样做，它把 watch 的更新放到了队列当中，对应的代码细节可以查看 [Vue 源码之 computed 和 watch](https://blog.csdn.net/zhoulei1995/article/details/114447005) 这篇博文。

```javascript
export default class Watcher {
  update () {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 渲染 watch 一般会进入这段逻辑
      queueWatcher(this)
    }
  }
}
```

这就导致，如果我们在数据状态改变之后，立刻读取 DOM 上的值，获取的还是之前的那个状态。

> 如果我们用了 nextTick 方法，那会有什么不同呢？

nextTick 主要实现的功能就是：将我们的执行操作放到异步任务队列中，等下次 DOM 更新循环之后执行。

不过我们需要注意的是 nextTick 要放到`改变状态的语句`之后，因为将 DOM 更新放到异步队列的方法和 nextTick 是一个。这样造成两个异步任务的优先级是一样的，如果谁先放到异步队列，谁就先执行。

# nextTick 实现
全局 Vue 构造函数的 nextTick 是在 initGlobalAPI 中定义的。

```javascript
export function initGlobalAPI (Vue: GlobalAPI) {
  Vue.nextTick = nextTick
}
```

Vue 实例上的 nextTick 是在 renderMixin 中定义的。

```javascript
export function renderMixin (Vue: Class<Component>) {
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
}
```

它们两个地方都是引用的 `src/core/util/next-tick.js` 中的 nextTick 方法。

```javascript
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

这里定义了一个全局队列 callbacks 用来缓存每次调用 nextTick 的回调函数。第一次执行时，pending 为 false，这时会执行 timerFunc 方法。当再次执行 nextTick 时，则不会执行 timerFunc 方法了。

我们先来看看 timerFunc 是怎么实现的。

```javascript
let timerFunc

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // setImmediate 某些情况下不比 setTimeout 快
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

这里面有一堆 if else，如果是第一次接触有些头疼。其实，就是分四种情况。优先将`队列的刷新`放到微任务中，如果执行环境不支持微任务，就降级到宏任务。

Promise 相信大家都很熟悉，MutationObserver 就比较陌生了，这个是浏览器为监控 DOM 新定义的一个 API，感兴趣可以[参考这里](https://javascript.ruanyifeng.com/dom/mutationobserver.html)。

setImmediate 是宏任务类型，对于一些人也算是比较陌生。setTimeout 和 setImmediate 的区别可以[参考这里](https://www.cnblogs.com/fsjohnhuang/p/4151595.html)。

> 这里博主有一个疑问，为什么要写一个 MutationObserver 分支。如果 Promise 都不支持，难道会支持 MutationObserver 吗？

最后我们再来看看 flushCallbacks 的内容。

```javascript
function flushCallbacks () {
  pending = false
  // 拷贝一份，防止清空队列时，callbacks 发生改变
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

**总而言之，nextTick 就是把当前任务先缓存起来，然后设置一个微任务去触发队列刷新。等当前执行栈的任务执行完了，再去执行微任务，即先前缓存的任务。**

> 之前某些版本，Vue 还在 next-tick.js 中暴露了触发宏任务 API，但是后面不知什么原因又移除了。

---

参考：
- [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/reactive/next-tick.html)