// Watcher.js: 订阅者原型，需要注意在vue中为每个绑定的属性创建一个单独的Watcher
// Watcher的主要任务包括:
// 1. 将创建的自身对象加入收集器Dep中
// 2. 捕获Observer发送的数据变化通知并调用对应的所绑定的渲染函数

// 总结：注意到cb是负责绑定到对应的DOM进行渲染的，而vm和exp指定了当前Watcher所绑定的属性
//      Watcher就是一手拿着绑定的属性，另一手拿着对应的DOM的渲染函数，一旦Observer通知当前Watcher属性值发生改变，Watcher立刻重新读取绑定的属性值，交付对应DOM的渲染函数进行重新渲染


/**
 * Watcher: Watcher原型的构造函数
 * @param {*} cb: 当前Watcher对象所需要绑定的渲染函数
 * @param {*} vm: 当前Watcher对象所绑定到的Vue实例对象
 * @param {*} exp: 当前Watcher对象所绑定的属性名
 */
function Watcher(vm, exp, cb) {
    this.cb=cb;             // 当前Watcher所绑定的DOM的渲染函数
    this.vm=vm;             // 当前Watcher所绑定到的Vue实例对象
    this.exp=exp;           // 当前Watcher所负责绑定的属性名
    this.value=this.get();  // 调用get方法获取当前Watcher所绑定的属性值，并将Watcher自身加入到Dep中
}

Watcher.prototype = {
    /**
     * get: 获取当前Watcher所负责渲染的属性的值，并将当前Watcher对象加入到收集器Dep中
    */
    get: function() {
        // 将当前Watcher对象加入到收集器的步骤只需要配合Observer中的设定即可
        // 1. 将当前Watcher对象写入全局缓存Dep.target
        Dep.target=this;
        // 2. 设法触发所负责渲染的属性的getter
        var value=this.vm.data[this.exp];       // this.vm就是绑定的Vue实例对象，所有属性均在其中，该Watcher所负责渲染的属性名为exp，因此vm[exp]就是目标的属性值
        // 3. 清空全局缓存Dep.target
        Dep.target=null;       // note: 实际上清空缓存的工作在Observer劫持属性的getter中已经做了，这里是一步冗余操作
        
        return value;
    },

    /**
     * update: 重新渲染所绑定的组件
     * note 1: update方法并不是直接重新渲染组件，这样的开销非常大，因为Observer只要一个属性变化就会通知所有的Watcher
     * note 2: 因此，首先应该判断数据是否真正发生了改变，若真的改变则重新渲染组件；否则无需重新渲染组件
     */
    update: function() {
        var newvalue=this.vm.data[this.exp];   // 当前绑定属性的最新值，this.value为绑定属性的旧值
        if(newvalue!==this.value) {        // 若绑定属性值确实改变，调用对应的渲染函数进行重新渲染
            let oldvalue=this.value;
            this.value=newvalue;
            this.cb.call(this.vm, newvalue, oldvalue);
        }
    }
}

