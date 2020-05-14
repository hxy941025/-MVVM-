class Compile {
    constructor(el, vm){
        this.el = this.isElement(el)? el: document.querySelector(el);
        this.vm = vm;

        //如果能获取到元素，才开始编译
        if(this.el){
            //1.先将真实的DOM存放到fragment内存中
            let fragment = this.node2fragment(this.el);

            //2.编译=>提取想要的元素节点v-model和文本节点{{}}
            this.compile(fragment);

            //3.将编译好的fragement塞回页面
            this.el.appendChild(fragment);
        }
    }


    //辅助方法：判断元素等
    isElement(node) { //判断是否是元素节点
        return  node.nodeType === 1;
    }

    node2fragment(el) { //需要将el中的内容全部放到内存中
        let fragment = document.createDocumentFragment();
        let firstChild;
        //每次取第一个元素节点，推入内存中
        while (firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment; //内存中的节点
    }


    //核心方法

    compileElement(node){
        //编译元素节点，判断其是否存在v-指令
        const attrs = node.attributes;
        Array.from(attrs).forEach((attr)=>{
            const attrName = attr.name;
            if(attrName.includes('v-')){
                const expr = attr.value;
                const [,type] = attrName.split('-');
                CompileUtil[type](node, this.vm, expr)
            }
        })
    }

    compileText(node){
        //编译文本节点，判断其是否存在{{}}
        const expr = node.textContent;
        const reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(expr)){
            CompileUtil['text'](node, this.vm, expr)
        }
    }



    compile(fragment) {
        //需要递归 遍历出所有子节点
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach((node)=>{
            if(this.isElement(node)){
                this.compileElement(node)
                this.compile(node)
            }else {

                this.compileText(node)
            }
        })

    }
}

CompileUtil = {
    getVal(vm, expr){
        //考虑数据为对象里嵌套对象的情况，应该将其切割然后逐步取值
        expr = expr.split('.');
        return expr.reduce((prev, next)=>{
            return prev[next];
        },vm.$data)
    },
    getTextVal(vm, expr){
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        });
    },
    text(node, vm, expr){
        let updateFn = this.updater['textUpdater'];
        //取到匹配值 返回内部表达式取值
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1], ()=>{
                //如果数据变化了，文本需要重新获取依赖的属性更新文本中的内容
                updateFn && updateFn(node, this.getTextVal(vm, expr));
            })
        });

        updateFn && updateFn(node, this.getTextVal(vm, expr));
    },

    setVal(vm, expr, value){
        expr = expr.split('.');
        return expr.reduce((prev, next, currentIndex)=>{
            // 当index为最后一个时，即为取到值，将其附上新值
            if(currentIndex === expr.length-1){
                return prev[next] = value;
            }
            return prev[next]
        }, vm.$data)

    },
    model(node, vm, expr){
        let updateFn = this.updater['modelUpdater'];
        //此处应该加一个监控 数据变化了 应该调用watch的cb重新获取值
        new Watcher(vm, expr, (newValue)=>{
            updateFn && updateFn(node, this.getVal(vm, expr));
        });
        node.addEventListener('input', (e) => {
            const newVal = e.target.value;
            this.setVal(vm, expr, newVal)
        })
        updateFn && updateFn(node, this.getVal(vm, expr));

    },
    updater:{
        textUpdater(node, value){
            node.textContent = value;
        },
        modelUpdater(node, value){
            node.value = value;
        }
    }
}