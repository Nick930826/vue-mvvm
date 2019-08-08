## Vue的数据双向绑定的实现
### 实现思路
- 1、data数据的劫持，observer.js实现
- 2、模板文件的编译，compile.js实现，具体做法是将根节点下的节点（元素节点和文本节点），都存到文档碎片中(document.createDocumentFragment())，通过判断元素和文本，去做处理，然后再塞回根节点
- 3、Watch观察者，通过数据劫持的特点以及js的单线程特点，在new Watch类的时候，
在内部通过取vm.data的值的时候，触发劫持get事件，把Watch的实例通过Dep.target植入Dep实例中的subs，
当set的时候通过dep.notify()通知模板中所有被观察的变量

- 4、input标签v-model改变，触发内容的变化，通知模板中相应变量的改变