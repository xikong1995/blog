<template>
    <div id="app">
        <h2>{{ $store.state.count }}</h2>
        <h3>{{ $store.getters.dubbleCount }}</h3>
        <button @click="muation">muation</button>
        <button @click="action">action</button>
    </div>
</template>

<script>
export default {
    name: "App",
    methods: {
        muation() {
            this.$store.commit("increment");
        },
        action() {
            this.$store.dispatch("increment");
        },
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
