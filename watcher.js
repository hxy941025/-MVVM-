class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.callback = cb;
        this.value = this.get();
    }

    get() {
        Dep.target = this;
        const value = this.getVal(this.vm, this.expr);
        Dep.target = null;
        return value;
    }

    getVal(vm, expr) {
        const exprArr = expr.split('.');
        const value = exprArr.reduce((prev, curt) => {
            return prev[curt]
        }, vm.$data);
        return value
    }

    update() {
        const oldVal = this.value;
        const newVal = this.getVal(this.vm, this.expr);
        if (newVal !== oldVal) {
            this.callback(newVal);
        }

    }
}

class Dep {
    constructor() {
        this.subs = [];
    }


    addSub(watcher) {
        this.subs.push(watcher)
    }


    notify() {
        this.subs.forEach(watcher => watcher.update());
    }

}