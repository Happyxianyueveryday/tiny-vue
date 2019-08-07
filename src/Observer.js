// Observer.js: 发布者定义，
// Observer的主要任务包括: 
// 1. 对给定的对象劫持其所有属性

// defineReactive: 对某个属性对象中的给定属性进行劫持
// param obj: 需要劫持的属性名所在的属性对象, Object
// param key: 需要劫持的属性名, str
// param val: 属性名key对应的属性对象, Object
function defineReactive(obj, key, val) {
    // 1. 
    var dep=new Dep();
 
    // 2. 首先递归地访问并劫持目标属性的所有子属性
    observe(val);

    // 3. 使用Object.defineProperty劫持当前属性，并为劫持的属性创建并增加watcher
    Object.defineProperty(obj, key, {
        set: function(newval) {
            if(newval!=val) {
                console.log("监听到属性发生改变")
                val=newval;
            }
        },
        get: function() {
            return val;     // 返回属性对象的值
        }
    });
}
    
// observe: 劫持给定对象的所有属性
// param obj: 劫持对象, Object
function observe(obj) {
    // 0. 若传入的需要劫持的对象为空或者传入的不是对象，则不做处理直接返回
    if(!obj||typeof obj!="object") {
         return;
    }

    // 1. 遍历给定对象的每个直接子属性
    let lis=Object.keys(obj);       // Object.keys获取目标对象的子属性列表
    lis.forEach(function(element) { // element为遍历用变量名
        defineReactive(obj, element, obj[element]);   // 对列表中的每个子属性，调用defineReactive方法依次进行劫持
    });                  
}
