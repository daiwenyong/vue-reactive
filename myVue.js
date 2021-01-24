
class MyVue{
    constructor(options){
        this.$options = options
        let data = this.$data = options.data

        //存储挂载点
        this.$el = this.isElementNode(options.el)?options.el:document.querySelector(options.el)

        //数据代理
        Object.keys(data).forEach(key=>{
            this.proxyData(key)
        })

        //劫持data数据
        new Observe(this,data)

        //编译挂载点的模板
        new Compiler(this)
    }

    proxyData(key){
        // console.log(key)  vm
        Object.defineProperty(this,key,{
            get(){
                // console.log('get')
                return this.$data[key]
            },
            set(newValue){
               // console.log('set',key,arguments)
                this.$data[key] = newValue
            }
        })

    }

    //判断是否是元素节点
    isElementNode(node){
        return node.nodeType === 1
    }

}
