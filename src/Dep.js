
// Dep: 消息中转器Dep的构造函数
function Dep() {
    this.lis=[];      // 存放订阅者（Watcher）的列表
}

// Dep.prototype: 消息中转器的对象原型
Dep.prototype.add=function(watcher) {
    this.lis.push(watcher);
};

Dep.prototype.notify=function() {
    this.lis.forEach(function(watcher) {
        watcher.update();      // 通知所有容器中的各个Watcher进行更新渲染操作
        console.log("进行更新订阅者的操作");
    });
}
