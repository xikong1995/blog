class Vue {
    constructor(option) {
        this.$data = option.data;
        this.observer(this, option.data);
        this.compile(this, option.el);
    }

    observer(vm, data) {
        Object.keys(data).forEach((key) => {
            const dep = new Dep();
            Object.defineProperty(vm, key, {
                get() {
                    if (Dep.target) {
                        dep.add(Dep.target);
                    }
                    return data[key];
                },
                set(value) {
                    data[key] = value;
                    dep.notify();
                },
            });
        });
    }

    compile(vm, el) {
        const html = document.querySelector(el);
        const children = html.children;
        Array.from(children).forEach((child) => {
            const raw = child.textContent;
            if (/\{\{(.*)\}\}/.test(raw)) {
                const atter = RegExp.$1;
                const watcher = new Watcher(function () {
                    child.textContent = raw.replace(`{{${atter}}}`, vm[atter]);
                });
                Dep.target = watcher;
                child.textContent = raw.replace(`{{${atter}}}`, vm[atter]);
                Dep.target = null;
            }
        });
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }

    add(fn) {
        this.subs.push(fn);
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        });
    }
}

Dep.target = null;

class Watcher {
    constructor(fn) {
        this.fn = fn;
    }

    update() {
        this.fn();
    }
}
