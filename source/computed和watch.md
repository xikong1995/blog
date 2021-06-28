> 学如逆水行舟，不进则退！当今社会，很美好，也很残酷。一般软件或互联网公司，大多数的业务其实是没有很高的难度，所以员工也没有什么机会去提升自己。不过值得庆幸的是，编程界开源风气盛行，功夫秘籍随手可得，而代价仅是你的时间。

本次文章的主题是 computed（计算属性） 和 watch（侦听器），**代码基于 Vue 2.6.11 版本**，和 2.5 还是有一些区别。

# 用法回顾
我们先来简单回顾下 computed 和 watch 的用法。

## computed

```javascript
export default {
    name: 'App',
    data() {
        return {
            user: {
                name: 'Jack',
                job: 'UI',
            },
        };
    },
    computed: {
        name() {
            return 'I am ' + this.user.name;
        },
    },
};
```

在 computed 属性中，我们定义了 name，其值来自 data 中 user.name。只要 user.name 的值发生了变化，那么 computed 中的 name 就行改变。

定义 computed 的好处就是我们可以定一个变量，很方便引用“其它的对象数据封装处理”后的值。并且 computed 中的属性是响应式的，值改变了，会触发 DOM 的更新。如果依赖的值没有改变，computed 的值不会重新计算，而是复用上一次缓存的值。

## watch

```javascript
export default {
    name: 'App',
    data() {
        return {
            color: 'red'
        };
    },
    watch: {
        color(newVal) {
            alert('Color is changed', newVal)
        }
    }
};
```

computed 主要关注的是值改变后的新值和缓存功能，而 watch 主要关注值改变后，我要做什么动作。

# 源码分析
如果读者从来没有阅读过 Vue 相关的源码，接下来的内容可能有点云里雾里。博主会尽量把内容放在 computed 和 watch 这一块的流程上，辅助少量的其他模块的细节。

## computed
Vue 在初始化时，会执行 _init，该方法在 Vue 原型对象上定义的。

```javascript
Vue.prototype._init = function (options?: Object) {
  const vm: Component = this

  // 省略了一大波细节

  // expose real self
  vm._self = vm
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')

  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```

这个方法里面有执行一个函数 `initState(vm)` ，包含如 data、computed、watch 等属性的处理逻辑。

```javascript
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

从上面代码中，我们在最后几行代码可以看到 computed 和 watch 的处理。顺便一提，这里的 nativeWatch 判断主要是用来处理火狐浏览器上的一个兼容性问题，火狐浏览器中其默认对象的原型上有一个原生的 watch 属性。

我们先来看看 `initComputed()` 这个方法。

```javascript
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```

首先遍历所有的计算属性，为每个属性定一个 watch，这里的 watch 是 `计算 watch`，而非 `渲染 watch`。接下来，再来看下 defineComputed 方法。

```javascript
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

注意 `Object.defineProperty(target, key, sharedPropertyDefinition)` 这行代码，就是进行数据代理，让我们可以通过 vm 实例上的同名属性来访问 computed 中定义的属性。

**这里比较复杂的就是 sharedPropertyDefinition 的 get 方法，即 createComputedGetter 方法的返回值。**

```javascript
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 脏数据条件下，会重新计算数据属性的值
      // 这是计算属性缓存的核心
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // Dep.target 为渲染 watch，先不用搞明白为什么
      // 这里是计算属性为什么会影响数据变化的核心
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```

先来看下 `watcher.evaluate()` 的逻辑

```javascript
export default class Watcher {
  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }
}
```

首先对计算属性就行求值，在我们例子中就是 `return 'I am ' + this.user.name;`，然后将 dirty 设为 false。这样，如果再次访问计算属性的值时，就不会重新求值了（会看上面 computedGetter 的逻辑）。至于 dirty 什么时候会改变，我们后面再说。

接下来，我们看下 `this.get()` 的逻辑。为了关注主线，代码做了简化。

```javascript
export default class Watcher {
  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    // 将 Dep.target 的值设为 计算 watch
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } finally {
      // 将 Dep.target 的值还原
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
}
```

当我们执行 `this.getter.call(vm, vm)` 时，会访问 `this.user.name`，所以会触发其依赖收集（这是 Vue data 响应式原理的一部分，如果不懂，建议先找资料看一看）。而这时候 Dep.target 的值为 `计算 watch`，依赖收集完后，双方互相保持对方的引用。即 `计算 watch` 中有 this.user.name 的 dep，而 this.user.name 的 dep 中有 `计算 watch`。

```javascript
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // 这里收集依赖
      // 也就是为什么 name 的值改变，会通知计算属性
      // 因为计算 watch 也加入到了 dep 的列表中
      if (Dep.target) {
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      dep.notify()
    }
  })
}
```

当 name 值改变了，会触发 set，然后通知 `计算 watch`，执行 update 方法。

```javascript
export default class Watcher {
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
}
```

因为 `计算 watch` 的 lazy 为 true，所以会执行 `this.dirty = true`。这里大家注意，它仅仅把 dirty 设为了 true，并没有真正重新求值。只有当计算属性再次被访问到时，才会走求值的逻辑。

执行完了 evaluate，我们再来看看 depend。

```javascript
function computedGetter () {
  const watcher = this._computedWatchers && this._computedWatchers[key]
  if (watcher) {
    if (watcher.dirty) {
      watcher.evaluate()
    }
    // 注意这个时候的 Dep.target 为 渲染 watch
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}
```

这个时候的 Dep.target 为 `渲染 watch`，可能有些人不太明白，这里稍微补充下。前面在执行 `watcher.evaluate()` 是会走到 `watch.get` 方法，而 get 方法调用了 `pushTarget(this)`。

```javascript
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

这里 Vue 用一个栈维护了多个 watch 的状态，大致的流程是：
1. []
2. [渲染 watch]
3. [渲染 watch, 计算 watch]
4. [渲染 watch]
5. []

因为读取都是从 mount 之后开始，所以 `渲染 watch` 被第一个加进去。

我们知道是 Dep.target 为 `渲染 watch` 之后，再来看下 `watcher.depend()` 的逻辑。

```javascript
export default class Watcher {
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
}
```

这里直接是在 name 的 dep 中加上了 `渲染 watch`。如果模板中同时存在了 data 的 name 和计算属性的 name，`渲染 watch` 只会添加一次。

> 这里和 2.5 版本有比较大的区别，因为 2.5 版本是为计算属性加了一个 dep，让渲染 watch 去订阅这个依赖。

有了这段逻辑，就可以让计算属性变成响应式的了。

## watch
说完 computed ，我们再来看看使用频率也比较多的 watch 实现原理。

```javascript
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

和 computed 一样，先是遍历所有属性，然后判断属性的值是否为数组。平时我们肯定很少用数组形式，不过 Vue 是支持在一个属性上定一个多个 handle 的。

```javascript
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```

createWatcher 也比较简单，因为我们 watch 的属性可以是函数、对象，也可以是字符串，这里做了一层统一处理，核心在 `$watch` 上。`$watch` 是在 Vue 原型上定义的一个方法。

```javascript
export function stateMixin (Vue: Class<Component>) {
  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 这是一个 用户 watch
    options.user = true
    // 最终是实例化了一个 Watch 对象
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```

从代码中，我们不难发现，watch 属性最终也是实例化了一个 watch 对象，不同的是，这里是一个 `用户 watch`。我们平时在项目中，也是可以自己手动调用 `this.$watch` 方法。所以这里取名 `user watch`，也是很贴合实际使用的。

```javascript
export default class Watcher {
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 用户 watch 会走这部分逻辑
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }
}
```

实例化 watch 时，会执行 `this.getter = parsePath(expOrFn)`。

```javascript
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
  	// 这里的 for 循环主要处理嵌套属性，如：'list.user.name'
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

parsePath 也很简单，通过函数柯里化，返回了一个新的函数。新函数 obj 参数在 watch 构造函数中是 vm 实例。

之后执行 `this.get()`，把 `用户 watch` 添加到依赖的数据的 dep 中。顺便一提，computed 的属性也是可以 watch 的。

```javascript
export default class Watcher {
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // 相信很多初学者，遇到过这个问题
      // 监听某个复杂对象时，改变了深层的属性，没有触发 watch 的回调
      // 在定义时，我们需要把 deep 设为 true
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
}
```

如果依赖的数据变化，就会触发 watch 的 update 方法。

```javascript
export default class Watcher {
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 默认情况会进入这段逻辑
      queueWatcher(this)
    }
  }

  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        // 如果是 用户 watch，那么就会执行传入的回调函数。
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
}
```

因为是 `用户 watch`，最终会执行 `queueWatcher(this)`，这个方法就不展开讲了，读者可以自行查看源码。这个方法内部会执行 `watch.run()` 方法，最终执行在 watch 上定义的处理函数。

# 总结
不管是 computed，还是 watch，最终都是通过实例化不同类型的 Watch 对象来实现数据监听的。目前来看，Vue 主要有三种 Watch：
1. 渲染 Watch
2. 计算 Watch
3. 用户 Watch

搞清楚了这些 Watch 的区别，那么 Vue 的响应式部分基本就理解了。

Vue 设计不得不说确实很精妙，有很多学习的地方。但是随着功能的增加，边界情况和兼容性问题的处理，以及更精简的封装，让初学者越来越难以阅读。
