class MVVM {
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;


        if (this.$el) {
            new Observer(this.$data);

            this.proxyData(this.$data);
            new Compile(this.$el, this);
        }
    }

    //将$data直接代理到vm实例上
    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                set(newVal) {
                    data[key] = newVal;
                },
                get() {
                    return data[key]
                }
            })
        })
    }
}