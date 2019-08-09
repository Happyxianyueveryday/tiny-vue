// Compile: Vue代码解释器

/**
 * Compile: Compile原型构造函数
 * @param {*} el: Vue实例对象所挂载的DOM的id
 * @param {*} vm: Vue实例对象
 */
function Compile(el, vm) {
    this.el=document.querySelector(el);     // Vue实例对象挂载的DOM对象
    this.vm=vm;                             // Vue实例对象
    this.fragment=null;                     // 文档碎片对象，文档碎片是一个小型的文档（或者说html元素/DOM）缓存器，请参见MDN上的在线教程
    this.init();                            // 调用初始化函数, 构造文档碎片对象fragment
}

Compile.prototype = {
    /**
     * init: 初始化文档碎片
     */
    init: function() {
        if(this.el) {   // 若能够找到指定id的DOM结点，则将其加载到文档碎片中，然后编译文档碎片
            this.fragment=this.nodeToFragment(this.el);   
            console.log(this.fragment);
            this.compileElement(this.fragment);           
            this.el.appendChild(this.fragment);           
        }
        else {          // 若找不到给定id的DOM结点，则挂载过程失败，直接不进行后续解析
            return;
        }
    },

    /**
     * nodeToFragment: 将原始的DOM对象转换称为文档碎片的形式
     * @param {*} el: Vue实例绑定的原始DOM对象
     */
    nodeToFragment: function(el) {
        var fragment=document.createDocumentFragment();   // 创建空的初始文档碎片

        // 使用循环依次提取原始DOM对象中的所有子DOM，例如对于测试的html，依次从其中取出<h2>,<input>,<h1>,<button>等html元素，并将这些html元素保存到文档碎片对象中
        var child=el.firstChild;                          
        while(child) {
            // console.log(child);
            fragment.appendChild(child);
            child=el.firstChild;
        }

        return fragment;
    },

    /**
     * compileElement: 解析文档片段对象
     * @param {*} el: 由nodeToFragment方法生成的fragment对象
     * @note: compileElement编译并且解析上述方法生成的fragment对象，识别出其中的Vue指令等
     */
    compileElement: function(el) {
        var childNodes=el.childNodes;  // 提取所有子DOM结点对象，例如<h1>,<h2>,<button>等
        // console.log(childNodes);

        [].slice.call(childNodes).forEach((node) => {   // [].slice.call(childNodes)实际上是把childNodes转化为列表对象
            // 对列表中的每个html元素(DOM)对象，使用正则表达式文本进行解析，注意此处需要使用箭头函数
            var reg=/\{\{(.*)\}\}/;          // 捕获mustache语法（例如{{data}}）的正则表达式文本
            var text=node.textContent;       // 将DOM对象转化为纯html代码文本形式

            // 若判断为元素结点，调用下面自定义的compile方法进行进一步解析
            // note: 关于DOM结点分类，请参见MDN上的相关文档说明
            if(this.isElementNode(node)) {  
                this.compile(node);    
            }
            // 若判断为文本结点（其中包含mustache语法的正则匹配规则），则解析出对应mustache语法的参数，并调用文本结点解析方法compileText进行进一步解析
            else if(this.isTextNode(node) && reg.test(text)) {  
                this.compileText(node, reg.exec(text)[1]);  // node为要渲染文本的结点，reg.exec(text)[1]为解析出的要显示的属性，例如'{{data}}'解析得到的reg.exec(text)[1]就是'data'
            }

            // 如果当前处理的DOM对象还有子DOM对象，则调用自身进行递归处理
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })      
    },

    /**
     * compile: 解析元素DOM结点
     * @param {*} node: 输入的元素DOM结点
     */
    compile: function(node) {
        var nodeAttrs = node.attributes;                      // 获取html元素的属性列表
        Array.prototype.forEach.call(nodeAttrs, (attr) => {   // 依次处理列表中的每个html属性
            // attr就是html元素中的各个属性文本，例如v-on:click="myFunction"
            // attr.name就是html属性名文本，例如v-on:click
            var attrName = attr.name;
            if (this.isDirective(attrName)) {      
                var exp = attr.value;               // html属性值（即Vue里所绑定的对象属性名）
                var dir = attrName.substring(2);    // dir即指令值（例如"on:click", "bind:src")

                if (this.isEventDirective(dir)) {   // 处理v-on指令
                    this.compileEvent(node, exp, dir);    // 调用v-on指令的解析函数
                } 
                else {                              // 处理v-model指令
                    this.compileModel(node, exp);    // 调用v-model指令的解析函数
                }
                node.removeAttribute(attrName);
            }
        });
    },

    /**
     * compileText: 文本DOM结点的解析函数
     * @param {*} node: 文本DOM结点对象
     * @param {*} exp: 解析出的mustache语法的属性名称
     */
    compileText: function(node, exp) {
        var initText = this.vm[exp];         // 因为exp就是文本结点的属性名，因此直接从Vue对象vm中取出vm[exp]就是mustache语法中的属性值
        this.updateText(node, initText);     // 调用updateText刷新DOM

        // 关键步骤：创建该文本DOM对应的Watcher对象（该Watcher对象的构造函数会自动触发加入到Observer的Dep中，请参见Watcher的源代码），创建的Watcher将DOM和对应的渲染函数绑定。
        new Watcher(this.vm, exp, (value) => {
            this.updateText(node, value);
        });
    },

    /**
     * compileEvent: 解析v-on指令的元素DOM结点
     * @param {*} node: 事件DOM结点对象
     * @param {*} exp: 解析出的所绑定的Vue实例方法(methods)名称
     * @param {*} dir: Vue指令名，例如"bind:src","on:click"
     */
    compileEvent: function (node, exp, dir) {
        var eventType = dir.split(':')[1];          // 事件名称
        var cb = this.vm.methods && this.vm.methods[exp];   // 提取v-on指令所绑定的Vue实例方法(methods)
        
        // 关键步骤：使用DOM的addEventListener内置方法，增加事件监听器，监听到事件时触发方法cb
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(this.vm), false);    //cb.bind方法的具体细节请参见MDN对应文档，该文档在函数cb的基础上创建一个新函数，该新函数的this绑定到bind的第一个参数上
        }
    },

    /**
     * compileModel: 解析v-model指令的元素DOM结点
     * @param {*} node: DOM结点对象
     * @param {*} exp: 解析出的所绑定的Vue实例方法(methods)名称
     */
    compileModel: function (node, exp) {
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);  // 完成挂载，{{ }}中的值被渲染为data中的值
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {   
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },

    /**
     * updateText: 文本DOM更新器
     * @param {*} node: 文本DOM结点
     * @param {*} value: 新的文本值
     */
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    /**
     modelUpdater: 模型DOM更新器
     * @param {*} node: 元素DOM结点
     * @param {*} value: 新的元素值
     */
    modelUpdater: function(node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    },

    /**
     * isDirective: 判断输入的html文本是否含有Vue动态指令
     * @param {} attr: 需要判断的DOM的html文本
     */
    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },

    /**
     * isEventDirective: 判断输入的html文本是否含有v-on指令
     * @param {*} dir: 需要判断的DOM的html文本
     */
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;
    },

    /**
     * isElementNode: 判断输入DOM结点是否为元素DOM结点
     * @param {*} node: DOM结点
     */
    isElementNode: function (node) {
        return node.nodeType == 1;
    },

    /**
     * isTextNode: 判断输入的DOM结点是否为文本DOM结点
     * @param {*} node: DOM结点
     */
    isTextNode: function(node) {
        return node.nodeType == 3;
    }
}
