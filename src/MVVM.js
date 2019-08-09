// MVVM.js: 集成器原型，将各个组件组合起来

/**
 * SelfVue: Vue对象原型，作为整个Vue双向绑定系统的集成器存在
 * @param {*} options: 输入参数对象，一般初始化Vue对象的语句类似var vm=new Vue({data:{name:"username"}});，这里传入的参数就是一个对象，Vue实例就是根据传入的临时对象的属性来初始化自身属性
 */
function SelfVue (options) {
    // 1. 用输入参数初始化自身属性
    var self = this;    
    this.data = options.data;        // 用输入参数对象的data属性初始化自身的data属性
    this.methods = options.methods;  // 用输入参数对象的methods属性初始化自身的methods属性

    // 2. 为Vue对象原型的每个属性设置代理，代理的功能是当输入参数options变化时，触发给定的函数proxyKeys进行更新和读取
    Object.keys(this.data).forEach(function(key) {   
        self.proxyKeys(key);
    });

    // 3. 调用观察者Observer，监听自身的data对象中的所有属性
    observe(this.data);              

    // 4. 调用解析器Compile，在挂载的对象中，解析存在Vue指令和特性的DOM对象，以及这些DOM所绑定的Vue实例属性，并根据上述两个参数生成渲染函数，从而创建各个Watcher对象，Watcher对象原型中完成了渲染函数和Vue实例属性的绑定
    new Compile(options.el, this);   

    // 5. 
    options.mounted.call(this); 
    console.log(this.__proto__)
}

SelfVue.prototype = {
    proxyKeys: function (key) {    // Vue实例原型中的每个属性通用的代理函数，当输入参数options的属性变化时，调用该函数进行更新或者读取
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter () {
                return self.data[key];
            },
            set: function setter (newVal) {
                self.data[key] = newVal;
            }
        });
    }
}