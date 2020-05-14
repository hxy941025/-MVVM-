class MVVM {
    constructor(options){
        //先把可用的东西挂载在实例上
        this.$el = options.el;
        this.$data = options.data;

        // 如果存在要编译的模板则开始编译
        if(this.$el){
            //编译前 数据劫持 就是把对象方法的所有属性改成get和set方法
            new Observer(this.$data);
            this.proxyData(this.$data);
            //用数据和元素进行编译
            new Compile(this.$el, this);
        }
    }

    proxyData(data){
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        })
    }

}