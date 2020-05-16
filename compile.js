class Compile {
    constructor(el, vm){
        this.el = this.isElement(el)? el : document.querySelector(el);
        this.vm = vm;

        if(this.el){
            const fragment =  this.node2fragment(this.el);

            this.compile(fragment);

            this.el.appendChild(fragment)
        }
    }


    // 判断是否为元素节点
    isElement(node){
        return node.nodeType === 1
    }

    //将DOM放到内存中
    node2fragment(el){
        const fragment = document.createDocumentFragment();
        while (el.firstChild){
            fragment.appendChild(el.firstChild)
        }
        return fragment;
    }


    //遍历所有节点，进行对应处理
    compile(fragment){
        Array.from(fragment.childNodes).forEach(node => {
            if(this.isElement(node)){
                this.compileElement(node);
                this.compile(node);
            }else {
                this.compileText(node);
            }
        })
    }

    //元素节点
    compileElement(node){
        const attrs = node.attributes;
        Array.from(attrs).forEach(item => {
            if(item.name.includes('v-')){
                const [, type] = item.name.split('-');
                const expr = item.value;
                CompileUtil[type](node, this.vm, expr)
            }
        })

    }

    //文本节点 匹配节点{{}}中的内容
    compileText(node){
        const reg = /{{([^}]+)}}/g;
        const expr = node.textContent;
        if(reg.test(expr)){
            const text = expr.replace(reg, '$1').trim();
            CompileUtil.text(node, this.vm, text)
        }

    }


}

CompileUtil = {
    getVal(vm, expr){
        const exprArr = expr.split('.');
        const value = exprArr.reduce((prev, curt)=>{
            return prev[curt]
        },vm.$data)
        return value
    },

    setVal(vm, expr, value) {
        const exprArr = expr.split('.');
        exprArr.reduce((prev, curt) => {
            if (curt === exprArr[exprArr.length - 1]) {
                return prev[curt] = value
            }
            return prev[curt]
        }, vm.$data)
    },

    model(node, vm, expr){
        const updateFn = this.updater['modelUpdater'];
        const value = this.getVal(vm, expr);
        new Watcher(vm, expr, (newVal) => {
            updateFn && updateFn(node, newVal);
        });
        node.addEventListener('input', e => {
            const newVal = e.target.value;
            this.setVal(vm, expr, newVal);
        });
        updateFn && updateFn(node, value);
    },

    text(node, vm, text){
        const updateFn = this.updater['textUpdater'];
        const value = this.getVal(vm, text);
        new Watcher(vm, text, (newVal) => {
            updateFn && updateFn(node, newVal);
        });
        updateFn && updateFn(node, value);
    },

    updater: {
        textUpdater(node, value){
            node.textContent = value;
        },
        modelUpdater(node, value){
            node.value = value;
        }
    }
}