相信用过 Vue 框架的朋友，一定听过 Vue Router。要想写一个复杂的单页应用，没有路由可不行。

Vue Router 默认开启的是 hash 模式，如果我们不想让浏览器中的 URL 包含影响美观的 `#`，我们可以开启 history 模式。不过这种 history 的模式稍微复杂一点，需要后端服务器配合。

学东西，最好是知其然，知其所以然。本文将从源码的角度分析 hash 与 history 这两种模式的实现，本文基于 Vue Router 3.5.1 版本。

# 单页应用
当我们在浏览器地址栏输入一个地址时，浏览器就会去服务端去请求内容。但每次点击一个链接，就去服务端请求，这样会有页面加载的等待。

后来慢慢就出现了单页应用，在第一次访问时，就把 html 文件，以及其他静态资源都请求到了客户端。之后的操作，只是利用 js 实现组件的展示和隐藏。除非需要刷新数据，才会利用 ajax 去请求。

但是纯粹的单页应用不方便管理，尤其是开发复杂应用的时候，需要有“多页面”的概念，并且很多用户习惯浏览器的前进后退的导航功能。

> 能不能有一种方法，可以在不向服务器发送请求的条件下，改变浏览器的 URL，以此来实现“多页面”概念？

答案是有，Vue Router 就是官方开发的一个插件，专门来做这件事。

# URL 相关 API
最早改变 URL，但不向服务器发送请求的方式就是 hash。比如这种：

```
https://music.163.com/#/discover/toplist
```

同时浏览器也提供了一个事件来监听 hash 的改变，当 URL 的片段标识符更改时，将触发 hashchange 事件 (跟在＃符号后面的URL部分，包括＃符号)。

```javascript
window.addEventListener('hashchange', function() {
  console.log('The hash has changed!')
}, false);
```

后来 HTML5 发布，history 对象又增加了两个方法，用来改变浏览器的 URL。只是改变浏览器的访问记录栈，但是不会向服务器发起请求。
- history.pushState(state, title[, url])：该方法会向浏览器会话的历史堆栈中添加一个状态。
- history.replaceState(stateObj, title[, url])：该方法与上一个方法类似，但区别是它会在历史堆栈中替换掉当前的记录。

下面给出一个方法示例，具体参数细节[查看这里](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState)。

```javascript
const state = { 'page_id': 1, 'user_id': 5 }
const title = ''
const url = 'hello-world.html'

history.pushState(state, title, url)
```

当我们调用 history 对象这两个方法时，会触发 popstate 事件，但不会触发 hashchange 事件。另外，在调用 pushState 方法后，我们点击浏览器的前进和后退按钮也会触发 popstate 事件。

> 不过 history 模式有个缺点，一旦我们点击了浏览器的刷新按钮，这时候会真正向服务器发起请求。当前处于首页还好，如果是其它页面，页面会报 404。所以，这种模式需要服务器端配置路由规则，防止出现 404 的情况。

# 源码中 hash 与 history 模式
Vue Router 源码中有一个 history 目录，有 4 个文件。
- base.js：history 基类
- hash.js：hash 模式
- html5.js：history 模式
- abstract.js：js 模拟历史堆栈，用于服务器端（这里不作分析）

> 为了帮助大家更好的理解 Vue Router，本文也会讲一些 hash 与 history 模式之外的内容。

我们先来看一看 VueRouter 对象，为了方便查看，这里只列了构造函数部分。

```javascript
export default class VueRouter {
  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)

    let mode = options.mode || 'hash'
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
}
```

VueRouter 接受一个 options 参数，我们使用时，会把 routes 配置传递进去。

VueRouter 首先根据 routes 配置文件，创建一个 matcher 对象。然后根据 mode 模式实例化不同的 history 对象，这里也是本文关注的重点。

VueRouter 整个构造函数简洁清晰，阅读起来十分友好。

我们先来看一看 hash history 和 html5 history 对象前下，我们先看看两者的基类。

```javascript
export class History {
  constructor (router: Router, base: ?string) {
    this.router = router
    this.base = normalizeBase(base)
    // start with a route object that stands for "nowhere"
    this.current = START
    this.pending = null
    this.ready = false
    this.readyCbs = []
    this.readyErrorCbs = []
    this.errorCbs = []
    this.listeners = []
  }

  listen (cb: Function) {
    this.cb = cb
  }

  transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    let route
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current)
    } catch (e) {
      this.errorCbs.forEach(cb => {
        cb(e)
      })
      // Exception should still be thrown
      throw e
    }
    const prev = this.current
    this.confirmTransition(
      route,
      () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
        if (onAbort) {
          onAbort(err)
        }
        if (err && !this.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
            this.ready = true
            this.readyErrorCbs.forEach(cb => {
              cb(err)
            })
          }
        }
      }
    )
  }

  confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    this.pending = route
    const abort = err => {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure(err) && isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => {
            cb(err)
          })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    const lastRouteIndex = route.matched.length - 1
    const lastCurrentIndex = current.matched.length - 1
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL()
      return abort(createNavigationDuplicatedError(current, route))
    }

    const { updated, deactivated, activated } = resolveQueue(
      this.current.matched,
      route.matched
    )

    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(m => m.beforeEnter),
      // async components
      resolveAsyncComponents(activated)
    )

    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, (to: any) => {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this.ensureURL(true)
            abort(createNavigationAbortedError(current, route))
          } else if (isError(to)) {
            this.ensureURL(true)
            abort(to)
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError(current, route))
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            // confirm transition and pass on the value
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }

    runQueue(queue, iterator, () => {
      // wait until async components are resolved before
      // extracting in-component enter guards
      const enterGuards = extractEnterGuards(activated)
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            handleRouteEntered(route)
          })
        }
      })
    })
  }

  updateRoute (route: Route) {
    this.current = route
    this.cb && this.cb(route)
  }
}
```

这里主要列出几个比较重要的方法。

## listen

```javascript
  listen (cb: Function) {
    this.cb = cb
  }
```

`listen()` 用来添加回调方法。路由改变后，会执行该方法。这一个地方很关键，用来通知渲染 watch 更新视图。给用户的感觉就是，页面的 URL 改变了，同时页面的内容也改变了。其实对于 Vue 内部来说，只是重新渲染了一个组件。

来看一看 listen 这个方法在哪调用了。

```javascript
export default class VueRouter {
  init (app: any /* Vue component instance */) {
 	/*
	* 省略了一大段
	*/
 	
	// 这里调用了 listen，添加了一个回调函数
	// app 是 vue 实例，而 _route 是一个响应式对象，它改变了会通知渲染 watch 更新视图
    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
}
```

_route 是什么时候被设为响应式对象的呢？其实是在插件 install 的时候，利用了 Vue.mixins 混入。

```javascript
export function install (Vue) {
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        // 将 _router 设为响应式对象
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
}
```

## transitionTo

```javascript
transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    let route
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current)
    } catch (e) {
      this.errorCbs.forEach(cb => {
        cb(e)
      })
      // Exception should still be thrown
      throw e
    }
    const prev = this.current
    this.confirmTransition(
      route,
      () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
        if (onAbort) {
          onAbort(err)
        }
        if (err && !this.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
            this.ready = true
            this.readyErrorCbs.forEach(cb => {
              cb(err)
            })
          }
        }
      }
    )
  }
```

这个方法逻辑比较简单，首先使用 this.router.match 方法，以及 location 和 current 参数，找到下一个跳转的路由。
-  location：RawLocation 对象，即下一个跳转的路由的字符串路径。
- current：Route 对象，当前路由对象。

找到下一个跳转的路由后，调用 confirmTransition 方法去执行一些钩子函数，即我们常用的路由导航守卫。

```javascript
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    this.pending = route
    const abort = err => {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure(err) && isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => {
            cb(err)
          })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    const lastRouteIndex = route.matched.length - 1
    const lastCurrentIndex = current.matched.length - 1
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL()
      return abort(createNavigationDuplicatedError(current, route))
    }

    const { updated, deactivated, activated } = resolveQueue(
      this.current.matched,
      route.matched
    )

    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(m => m.beforeEnter),
      // async components
      resolveAsyncComponents(activated)
    )

    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, (to: any) => {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this.ensureURL(true)
            abort(createNavigationAbortedError(current, route))
          } else if (isError(to)) {
            this.ensureURL(true)
            abort(to)
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError(current, route))
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            // confirm transition and pass on the value
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }

    runQueue(queue, iterator, () => {
      // wait until async components are resolved before
      // extracting in-component enter guards
      const enterGuards = extractEnterGuards(activated)
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            handleRouteEntered(route)
          })
        }
      })
    })
  }
```

confirmTransition 这个方法比较复杂，里面写了很多高阶函数。在路由钩子函数执行的过程中，会执行 confirmTransition 方法的第二个参数方法，这个方法主要是用来触发视图渲染的。

## hash

路由钩子函数执行了，视图也重新渲染了。有人可能会问，URL 是什么时候改变的呢？别急，接下来就重点分析下 URL 相关的内容。

回顾一下 VueRouter 的 init 方法。在安装插件时，我们通过 Vue.mixins 在每个 beforeCreate 钩子中加入了这样一段逻辑。

```javascript
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        // 执行 VueRouter 的 init 方法
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
```

```javascript
  init (app: any /* Vue component instance */) {
	// 省略一段
	
    this.app = app

    const history = this.history

    if (history instanceof HTML5History || history instanceof HashHistory) {
      const handleInitialScroll = routeOrError => {
        const from = history.current
        const expectScroll = this.options.scrollBehavior
        const supportsScroll = supportsPushState && expectScroll

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this, routeOrError, from, false)
        }
      }
      // 设置了一个监听器，主要监听 URL 的变化
      const setupListeners = routeOrError => {
        history.setupListeners()
        handleInitialScroll(routeOrError)
      }
      // 这里调用了 transitionTo 方法，触发视图的改变
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      )
    }

    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
  }
```

我们来看一看 setupListeners 方法，该方法只是在基类中声明了，具体的实现在继承类中。先看下 hash 类型。

```javascript
  setupListeners () {
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    const handleRoutingEvent = () => {
      const current = this.current
      if (!ensureSlash()) {
        return
      }
      // URL 改变后，又会调用 transitionTo 进行跳转
      this.transitionTo(getHash(), route => {
        if (supportsScroll) {
          handleScroll(this.router, route, current, true)
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
    const eventType = supportsPushState ? 'popstate' : 'hashchange'
    window.addEventListener(
      eventType,
      handleRoutingEvent
    )
    this.listeners.push(() => {
      window.removeEventListener(eventType, handleRoutingEvent)
    })
  }
```

这里我们看到了前面讲的浏览器事件 popstate 和 hashchange。原来 hash 模式下，不只是用 hashchange 事件监听 URL 变化，它会优先使用 popstate 事件。在不支持 popstate 情况下，才会降级使用 hashchange。

在实际开发中，我们经常会用 `$router.push` 和 `$router.replace` 进行跳转，我们来具体看一看其代码实现。

```javascript
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        // 见下面代码块
        pushHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {	
        // 见下面代码块
        replaceHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }
```

```javascript
// 该方法是 URL 为什么带 # 号的关键
function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}

function pushHash (path) {
  if (supportsPushState) {
    // 注意，这里调用了 getUrl 方法
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}

function replaceHash (path) {
  if (supportsPushState) {
  	// 注意，这里调用了 getUrl 方法
    replaceState(getUrl(path))
  } else {
    window.location.replace(getUrl(path))
  }
}
```

这部分代码比较简单，就不多说了。再看下 pushState 和 replaceState 的实现，它们在 /util/push-state.js 文件中定义。

```javascript
export function pushState (url?: string, replace?: boolean) {
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    if (replace) {
      // preserve existing history state as it could be overriden by the user
      const stateCopy = extend({}, history.state)
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
```

## history
其实 history 和 hash 的代码实现很像，只有一些地方不同。

```javascript
  setupListeners () {
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    const handleRoutingEvent = () => {
      const current = this.current

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation(this.base)
      if (this.current === START && location === this._startLocation) {
        return
      }

      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    }
    // 这里直接监听 popstate
    window.addEventListener('popstate', handleRoutingEvent)
    this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
    })
  }
```

history	没有判断当前环境是否支持 popstate，这里直接监听 popstate 事件。因为 mode 模式是使用者自己定义的，所以将这部分的判断逻辑交给了使用者。

```javascript
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      pushState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
      replaceState(cleanPath(this.base + route.fullPath))
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    }, onAbort)
  }
```

push 和 replace 没有调用 getUrl 对路径进行处理，所以 URL 没有 # 号。

# 总结
本文大致梳理了 VueRouer 的执行流程，包括插件安装、路由实例化、路由跳转、路由监听、视图更新，URL 改变等等。重点分析 hash 和 history 两种模式的具体实现。

hash 和 history 在代码中的主要不同是：
- hash 在监听路由变化时，会优先判断当前环境是否支持 popState，不支持才会降级使用 hashchange
- history 在监听路由变化时，直接使用 popState 事件
- hash 在修改 URL 时，会优先判断是否支持 history.pushState 和 history.replaceState 方法，不知出才会降级使用 `window.location.hash = path` 和 `window.location.replace(url)`
- history 在修改 URL 时，直接使用 history.pushState 和 history.replaceState 方法

还有一点大家要注意，popState 只有在使用 history.pushState 和 history.replaceState 方法改变 URL 时才会触发，或者点击浏览器的前进和后退。

如果我们直接在浏览器输入一个地址是不会触发 popState 事件的，用 location.href 等方法改变 URL 也不会触发。有意思的是使用 history.pushState 和 history.replaceState 方法改变 URL 也不会触发 hashchange 的改变。

所以我们在使用这些方法和事件时，不要混用了。
