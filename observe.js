class Observe {
    constructor(vm) {
        this.vm = vm
        //开始劫持数据
        this.observe(vm.$data)
    }

    observe(data) {
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })
    }

    defineReactive(data, key, value) {
        console.log(value)
        const dep = new Dep(key)
        console.log(dep)
        Object.defineProperty(data, key, {
            get() {
                console.log('get')
                if (Dep.target) {
                    dep.addSub(Dep.target)
                    console.log(dep)
                }
                return value
            },
            set(newValue) {
                console.log(value, newValue)
                if (value !== newValue) {
                    value = newValue
                    dep.notife()
                }
                // console.log(v)
                // data[key] = v
            }
        })
    }
}
