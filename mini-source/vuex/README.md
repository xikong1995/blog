# Vuex

## 概念

本质来讲 vuex 是一个全局变量，不过相比普通的全局变量它多了响应式的功能。

同时，为了更好的管理和追踪这个全局变量，增加了一些约束。例如定义了 state、getters、mutations、actions 等等。

为了应付更加庞大和复杂的项目，增加了 module ，类似命名空间，方便更好的组织代码和变量。

## vue 中引入 vuex 的步骤

1. 安装 Vuex，再通过 `import Vuex from 'vuex'` 引入
2. 先 `var store = new Vuex.Store({...})`，再把 store 作为参数的一个属性值，`new Vue({store})`
3. 通过 `Vue.use(Vuex)` 使得每个组件都可以拥有 store 实例
