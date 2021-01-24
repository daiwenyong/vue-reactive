class Compiler {
  constructor(vm) {
    this.reg = /\{\{(.+?)\}\}/g

    this.vm = vm
    this.fragment = this.node2Fragment(vm.$el)
    this.compile(this.fragment)
    this.vm.$el.appendChild(this.fragment)


  }

  node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    let child = null
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  compile(node) {
    Array.from(node.childNodes).forEach(itemNode => {
      if (this.isTextNode(itemNode) && this.reg.test(itemNode.nodeValue)) {
        //console.log(itemNode.nodeValue)
        this.complieText(itemNode, this.vm)
      } else if (this.isElementNode(itemNode)) {
        this.complieElement(itemNode, this.vm)
        this.compile(itemNode)
      }
    })

  }

  complieText(node) {
    node.nodeValue = node.nodeValue.replace(this.reg, ($, exp) => { //exp = person.name
      new Watcher(exp, this.vm, function (newValue, oldValue) {
        console.log(newValue)
        node.nodeValue = node.nodeValue.replace(oldValue, () => {
          return newValue
        })
      })
      return CompileUtil.getValue(exp, this.vm)
    })
  }

  complieElement(node, vm) {
    //console.log(node.attributes) //所有的元素节点的指令
    let attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      //console.log(attr) //v-test='msg'
      let {nodeName, nodeValue} = attr
      //console.log(nodeName,nodeValue) //@click onClick
      if (this.isEventDirective(nodeName)) {
        CompileUtil.eventHandler(node, nodeName, nodeValue, this.vm)
      } else if (this.isDirective(nodeName)) { //v-test,msg
        //console.log(nodeName)
        let [, exp] = nodeName.split('v-')
        //console.log(exp) //text msg vm
        CompileUtil[exp](node, nodeValue, this.vm)
      }
      node.removeAttribute(nodeName)
    })
  }


  isDirective(nodeName) {
    return nodeName.startsWith('v-')
  }

  isEventDirective(nodeName) {
    return nodeName.startsWith('@')
  }

  isTextNode(node) {
    return node.nodeType === 3
  }

  isElementNode(node) {
    return node.nodeType === 1
  }
}

CompileUtil = {
  html(node, exp, vm) {
    node.innerHTML = this.getValue(exp, vm)
    new Watcher(exp, vm, function (newValue) {
      node.innerHTML = newValue
    })
  },
  text(node, exp, vm) {
    //console.log(this.getValue(exp,vm))
    node.innerText = this.getValue(exp, vm)
    new Watcher(exp, vm, function (newValue) {
      //node.innerText = this.getValue(exp,vm) //使用这个 会多触发一次get
      node.innerText = newValue
    })
  },
  class(node, exp, vm) {
    let className = this.getValue(exp, vm)
    if (!node.classList.contains(className)) {
      node.classList.add(className)
    }
    new Watcher(exp, vm, function (className) {
      console.log(122)
      if (!node.classList.contains(className)) {
        node.classList.add(className)
      }
    })
  },
  model(node, exp, vm) {
    node.value = this.getValue(exp, vm)
    new Watcher(exp, vm, function (newValue) {
      node.value = newValue
    })
    node.addEventListener('input', function (e) {
      console.log(e.target.value)
      vm[exp] = e.target.value
    })
  },
  eventHandler(node, exp, handler, vm) {
    let reg = /\(\)=>\{(.+?)\}/g //箭头函数
    let [, eventType] = exp.split('@')

    let eventFn = null
    if (reg.test(handler)) {
      handler.replace(reg, ($, $1) => {
        // console.log(handler)// '()=>{this.person.name='欧巴'}'
        //console.log($1) // this.person.name='欧巴'
        eventFn = new Function($1)
      })
    } else if(handler.includes('=')){
      //console.log(handler) // 'person.name='欧巴''
      let [exp,] = handler.split('.')
      //console.log(exp) //person
      if (!vm.$data[exp]) { //如果变量不是data里面的值
        throw `${exp} is not defined`
        return;
      }
      handler = 'this.'+handler
      //console.log(handler)//'this.person.name='欧巴''
      eventFn = new Function(handler)
    }else if(vm.$options.methods[handler]){
      eventFn = vm.$options.methods[handler]
    } else{
      throw (`${handler} is not defined`)
      return
    }
    node.addEventListener(eventType, eventFn.bind(vm))
   // node.addEventListener(eventType, methodsHandler.bind(vm))
  },
  getValue(exp, vm) {
    return exp.split('.').reduce((pre, next) => {
      return pre[next]
    }, vm.$data)
  }
}
