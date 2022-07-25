class Watcher {
    constructor(exp, vm, cb) {
        this.exp = exp
        this.vm = vm
        this.cb = cb

        this.value = this.getValue()
    }

    getValue() {
        Dep.target = this
        let value = CompileUtil.getValue(this.exp, this.vm)
        Dep.target = null
        return value
    }

    update() {
        //console.log('update')
        let newValue = CompileUtil.getValue(this.exp, this.vm)
        this.cb(newValue, this.value)
        this.value = newValue
    }
}

class Dep {
    constructor(key) {
        this.subs = []
        this.key = key
    }

    addSub(w) {
        this.subs.push(w)
    }

    notify() {
        console.log(this, this.subs)
        this.subs.forEach(item => {
            item.update()
        })
    }
}
