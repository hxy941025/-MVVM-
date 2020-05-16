class Watcher {
    //给需要变化的DOM增加一个观察者，当数据变化后执行对应方法
    //用老值和新值对比，如果发生变化则调用更新方法

    constructor(vm, expr, cb){
        this.vm = vm;
        this.expr = expr;
        this.cb =cb;
        this.value = this.get();
    }

    getVal(vm, expr){
        //考虑数据为对象里嵌套对象的情况，应该将其切割然后逐步取值
        expr = expr.split('.');
        return expr.reduce((prev, next)=>{
            return prev[next];
        },vm.$data)
    }

    get(){
        //每当一个元素或文本节点需要去观察一个数据时便会new一个watcher，此时Dep.target将该watcher绑定，当取值触发getter时，将该watcher推入订阅数组
        Dep.target = this;
        //new的时候即可取到老值
        let value = this.getVal(this.vm, this.expr);
        Dep.target = null;
        return value
    }

    //对外暴露的方法，值变化时调用此方法
    update(){
        //先拿到新值
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if(newValue != oldValue){
            this.cb(newValue) //对应watch的callback
        }
    }

}