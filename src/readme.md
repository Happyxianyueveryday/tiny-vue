## Vue双向绑定原理详解

Vue双向绑定包括从数据到视图的绑定和视图到数据的绑定，其中从视图到数据的绑定是较为简单的，当视图变化时，直接使用js中类似onclick的事件处理机制即可完成。但是从数据到视图的绑定是难度较大的。如何实现当数据变化时视图随之更新，是本文档说明的重点。

在Vue中，从数据到视图的绑定是基于数据劫持和发布者-订阅者模式两种重要技术实现的。

### 1. 数据劫持
在js中，使用Object.defineProperty()方法实现数据劫持的，该方法的原型是：

```
/** 
 * Object.defineProperty: 精确添加或者修改对象的属性
 * param obj: 要在其上定义属性的对象
 * param prop: 要定义或修改的属性的名称
 * param descriptor: 将被定义或修改的属性描述符
 */
Object.defineProperty(obj, prop, descriptor)
```
在双向绑定的实现中，则只需要关注两个方法属性get和set，（不熟悉这两个方法属性的话可以参考https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty） 一个示例用法如下：

```
```

