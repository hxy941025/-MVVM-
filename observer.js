class Observer {
    constructor(data) {
        this.observe(data)
    }

    observe(data) {
        if (!data || typeof data !== 'object') {
            return;
        }

        Object.keys(data).forEach(key => {
            //属性逐个绑定数据劫持
            this.defineReactive(data, key, data[key]);
            this.observe(data[key])
        })
    }

    defineReactive(data, key, value) {
        const that = this;
        const dep = new Dep;
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,

            get() {
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newVal) {
                if (newVal !== value) {
                    that.observe(newVal)
                    value = newVal;
                    dep.notify();
                }
            }

        })
    }
}