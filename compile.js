class Compile {
	constructor (el, vm) {
		this.el = this.isElementNode(el) ? el : document.querySelector(el)
		this.vm = vm
		if (this.el) {
			/* 1.因为操作真实dom会造成页面的频回流重绘，所以把node节点都存到文档片段里去
			因为文档片段存在于内存中，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流
			（对元素位置和几何上的计算）。因此，使用文档片段通常会带来更好的性能。*/
			
			let fragment =this.node2fragment(this.el)

			/* 2.编译——提取想要的元素节点v-model和文本节点 {{}} */

			this.compile(fragment)

			/* 编译结束，塞回页面根节点 */

			this.el.append(fragment)

		}
	}
	/* 辅助方法 */
	/* 是否是元素节点 */
	isElementNode (node) {
 		return node.nodeType === 1
	}

	isDirector (name) {
		return name.includes('v-')
	}

	/* 核心方法 */

	complieElement (node) {
		let attr = Array.from(node.attributes)
		attr.forEach(attr => {
			let attrName = attr.name
			if (this.isDirector(attrName)) {
				// node this.vm.$data expr
				let expr = attr.value
				let [,type] = attrName.split('-')
				CompileUtil[type](node, this.vm, expr)
			}
		})
	}

	compileText (node) {
		let expr = node.textContent // {{ expr: message }}
		let reg = /\{\{([^}]+)\}\}/g
		if (reg.test(expr)) {
			// node this.vm.$data expr
			CompileUtil['text'](node, this.vm, expr)
		}
	}

	compile (fragment) {
		// 这边需要递归
		let childNodes = Array.from(fragment.childNodes)
		childNodes.forEach(node => {
			
			if (this.isElementNode(node)) {
				// 元素节点
				this.complieElement(node)
			} else {
				// 文本节点
				this.compileText(node)
			}
		})
	}

	node2fragment (el) {
		let fragment = document.createDocumentFragment()
		let firstChild
		while (firstChild = el.firstChild) {
			fragment.append(firstChild)
		}
		return fragment
	}
}

CompileUtil = {
	getValue (vm, expr) {
		expr = expr.split('.')
		return expr.reduce((prev, next) => {
			return prev[next]
		}, vm.$data)
	},
	getTextValue (vm, expr) {
		let reg = /\{\{([^}]+)\}\}/g
		return expr.replace(reg, (...arguments) => {
			return this.getValue(vm, arguments[1].trim())
		})
	},
	setValue (vm, expr, value) {
		expr = expr.split('.')
		return expr.reduce((prev, next, currentIndex) => {
			if (currentIndex == (expr.length - 1)) {
				return prev[next] = value
			}
			return prev[next]
		}, vm.$data)
	},
	text (node, vm, expr) {
		// 文本处理
		let value = this.getTextValue(vm, expr)
		let reg = /\{\{([^}]+)\}\}/g
		/* 这边获得的expr和model不一样，{{ message }}
		这样的字符串需要经过正则匹配出里面的message字符串
		才能在vm里匹配相应的属性*/
		expr.replace(reg, (...arguments) => {
			console.log('arguments[1].trim()', arguments[1].trim())
			new Watcher(vm, arguments[1].trim(), (newValue) => {
				// 如果数据变化了，文本节点需要重新获取依赖的属性更新文本的内容
				/*this.updater.textUpdater(node, newValue)
				如果这样赋值的话 {{ message.a }} 和 {{ message.b }}
				都会被覆盖掉，比如：message.b = 100，页面上的text节点会被100覆盖掉*/
				console.log('执行cb')
				this.updater.textUpdater(node, this.getTextValue(vm, expr))
			})
		})
		
		this.updater.textUpdater(node, value)
	},
	model(node, vm, expr) {
		// 输入框的处理
		let value = this.getValue(vm, expr)
		new Watcher(vm, expr, (newValue) => {
			this.updater.modelUpdater(node, newValue)
		})
		this.updater.modelUpdater(node, value)

		node.addEventListener('input', (e) => {
			// 这边是需要改变vm.$data	的值，才能出发到页面的观察者
			let newValue = e.target.value
			this.setValue(vm, expr, newValue)
		})
	},
	updater: {
		// 文本更新
		textUpdater(node, value) {
			node.textContent = value
		},
		// 输入框更新
		modelUpdater(node, value) {
			node.value = value
		}
	}
}








