class Observer {
    constructor(data){
        this.observe(data)
    }

    observe(data){
        //要将这个data数据将原有的属性改成set和get形式
        //当数据不是对象或者不存在时不作任何操作
        if(!data || typeof data !== 'object'){
            return;
        }

        //将数据一一劫持 先获取到data的key和value
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
            this.observe(data[key])
        })

    }

    defineReactive(obj, key, value){
        const that = this;
        const dep = new Dep(); //每个变化的数据都对应一个数组，这个数组是存放所有更新的操作
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get(){
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newVal){
                if(newVal != value){
                    that.observe(newVal);
                    value = newVal;
                    dep.notify(); //通知所有人数据更新
                }
            }

        })
    }
}

class Dep {
    constructor(){
        //订阅的数组
        this.subs = []
    }

    //添加订阅
    addSub(watcher){
        this.subs.push(watcher)
    }

    //发布订阅
    notify(){
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }

}