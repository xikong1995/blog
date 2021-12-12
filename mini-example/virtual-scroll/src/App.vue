<template>
    <div id="app" @scroll="onScroll" ref="app">
        <div class="content">
            <ul class="item-wrapper" ref="box">
                <li
                    ref="item"
                    class="item"
                    :class="item.index % 2 === 0 ? 'gray' : ''"
                    v-for="item in visibleData"
                    :key="item.index"
                    :style="{ height: item.height + 'px' }"
                >
                    {{ item.index }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
function rnd() {
    return ~~(Math.random() * 50) + 30;
}

export default {
    name: "App",
    data() {
        return {
            data: [],
            visibleData: [],
            start: 0,
            positionHeight: [],
        };
    },
    created() {
        for (let i = 0; i < 1000; i++) {
            this.data.push({
                index: i,
                height: rnd(),
            });
        }
        this.calcHeight();
    },
    mounted() {
        this.containerHeight = this.$refs.app.clientHeight;
        this.updateVisible(0);
    },
    methods: {
        calcHeight() {
            let currHeight = 0;
            this.data.forEach((item, index) => {
                currHeight += item.height;
                this.positionHeight.push({
                    index,
                    top: currHeight - item.height,
                    bottom: currHeight,
                    height: item.height,
                });
            });
        },
        findStart(scrollTop) {
            const item = this.positionHeight.find(
                (item) => item.bottom > scrollTop
            );
            return item;
        },
        findEnd(scrollTop) {
            const item = this.positionHeight.find(
                (item) => item.top > scrollTop + this.containerHeight
            );
            return item;
        },
        onScroll() {
            const scrollTop = this.$refs.app.scrollTop;
            this.updateVisible(scrollTop);
        },
        updateVisible(scrollTop) {
            const startItem = this.findStart(scrollTop);
            const endItem = this.findEnd(scrollTop);
            this.visibleData = this.data.slice(startItem.index, endItem.index);
            this.$refs.box.style.transform = `translateY(${startItem.top}px)`;
        },
    },
};
</script>

<style>
* {
    margin: 0;
    padding: 0;
}
html,
body {
    height: 100%;
}
li {
    list-style: none;
}

#app {
    height: 100%;
    overflow-y: scroll;
}
.content {
    height: 30000px;
}
.item-wrapper {
    width: 100%;
}
.item {
    height: 40px;
    width: 100%;
}
.gray {
    background-color: #eee;
}
</style>
