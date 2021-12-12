import Vue from "vue";
import Vuex from "../lib/vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        count: 1,
    },
    getters: {
        dubbleCount: (state) => {
            return 2 * state.count;
        },
    },
    mutations: {
        increment(state) {
            state.count++;
        },
    },
    actions: {
        increment(context) {
            context.commit("increment");
        },
    },
});
