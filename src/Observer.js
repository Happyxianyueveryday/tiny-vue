// Observer.js: 发布者原型
// Observer的主要任务包括: 
// 1. 对给定的对象劫持其所有属性
// 2. 在getter中将Watcher对象加入收集器Dep：若新Watcher对象的缓存Dep.target不为空，则在getter中将缓存的新Watcher（也即Dep.target）加入收集器Dep，然后重新将缓存Dep.target置为空，等待缓存中下一个新Watcher对象的到来
// 3. 在setter中捕获劫持属性的变化并通知收集器Dep中的所有Watcher：当所劫持的属性发生改变时，通知收集器Dep中的所有的Watcher

// 总结： Observer一手劫持属性监听变化，一手拿着各个劫持属性的Watcher，监听到劫持的属性发生变化就立刻通知所有Watcher进行重新渲染


/**
 * Observer: Observer的构造函数
 * @param {*} obj: 需要劫持其所有属性的对象
 */
function Observer(obj) {    
    this.obj=obj;
    this.walk(obj);   
}

Observer.prototype = {
    /**
     * walk: 劫持给定对象的所有属性
     * @param obj: 劫持对象, Object
    */
    walk: function(obj) {
        // 1. 遍历给定对象的每个直接子属性
        let lis=Object.keys(obj);       // Object.keys获取目标对象的子属性列表
        lis.forEach((element) => {      // 这里推荐使用箭头函数，箭头函数捕获该函数所在的上下文的this，并将其作为自己的this，注意只有大括号能够分隔上下文，而小括号不行
            this.defineReactive(obj, element, obj[element]);   // 对列表中的每个子属性，调用defineReactive方法依次进行劫持
        });                  
    },

    /**
     * defineReactive: 对某个属性对象中的给定属性进行劫持
     * @param obj: 需要劫持的属性名所在的属性对象, Object
     * @param key: 需要劫持的属性名, str
     * @param val: 属性名key对应的属性对象, Object
    */
    defineReactive: function(obj, key, val) {
        // 1. 创建一个收集器Dep
        var dep=new Dep();
 
        // 2. 递归地访问并劫持目标属性的所有子属性
        objObserver=observe(val);

        // 3. 使用Object.defineProperty劫持目标属性
        // 3.1 在get中，判断当Watcher对象的缓存Dep.target不为空时，将缓存的新Watcher对象加入收集器Dep，然后重新将缓存清空
        // 3.2 在set中，判断属性的新值不等于旧值时，将消息通知收集器Dep中存放的所有的Watcher对象
        Object.defineProperty(obj, key, {
            set: function(newval) {
                if(newval!=val) {         // 若属性值发生改变
                    console.log("监听到属性发生改变");
                    val=newval;           
                    objObserver=observe(newval); // 易错点: 如果属性改变后的值是一个对象，则需要重新进行监听（因为原来的属性只是单独的一个属性） 
                    dep.notify();                // 通知收集器Dep中的所有的Watcher对象
                }
            },
            get: function() {
                if(Dep.target) {          // 若缓存中存在新的Watcher对象
                    console.log(Dep.target);
                    dep.add(Dep.target);  // 将新的Watcher对象加入收集器Dep
                    Dep.target=null;      // 重新清空缓存，等待下一个新的Watcher对象的到来
                }
                return val;     // 返回属性对象的值
            }
        });
    },
}

/**
 * observe: 外部调用接口，类似于单例模式，仅有传入对象为非空才返回Observer对象
 * @param {*} obj: 要进行劫持的目标对象
 */
function observe(obj) {
    if(!obj||typeof obj!="object") {   // 若传入的需要劫持的对象为空或者传入的不是对象，则不做处理直接返回
        return null;
    }
    else {                             // 传入的需要劫持的对象符合要求时，进行劫持操作
        return new Observer(obj);
    }
}
