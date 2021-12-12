let Vue;

function install(_Vue) {
    if (Vue && Vue === _Vue) {
        return;
    }
    Vue = _Vue;
    Vue.mixin({
        beforeCreate() {
            if (this.$options && this.$options.store) {
                this.$store = this.$options.store;
            } else {
                this.$store = this.$parent && this.$parent.$store;
            }
        },
    });
}

class Store {
    constructor(options = {}) {
        const store = this;

        const computed = {};
        store.getters = options.getters || {};
        Object.keys(store.getters).forEach((key) => {
            computed[key] = partial(store.getters[key], store);
            Object.defineProperty(store.getters, key, {
                get: () => store._vm[key],
                enumerable: true,
            });
        });

        const state = options.state || {};
        store._vm = new Vue({
            data: {
                $$state: state,
            },
            computed,
        });

        const mutations = options.mutations || {};
        store._mutations = {};
        Object.keys(mutations).forEach((method) => {
            store._mutations[method] = function(arg) {
                return mutations[method](store.state, arg);
            };
        });

        const actions = options.actions || {};
        store._actions = {};
        Object.keys(actions).forEach((method) => {
            store._actions[method] = function(arg) {
                return actions[method](store, arg);
            };
        });
    }

    get state() {
        return this._vm._data.$$state;
    }

    commit(_type, _payload) {
        this._mutations[_type](_payload);
    }

    dispatch(_type, _payload) {
        this._actions[_type](_payload);
    }
}

function partial(getter, store) {
    return function() {
        return getter(store.state, store.getters);
    };
}

export default { install, Store };
