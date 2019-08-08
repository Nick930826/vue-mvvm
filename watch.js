class Watcher {
	constructor (vm, expr, cb) {
		this.vm = vm
		this.expr = expr
		this.cb = cb
		// 保存好旧的数据
		this.value = this.get(this.vm, this.expr)
	}

	getValue (vm, expr) {
		expr = expr.split('.')
		return expr.reduce((prev, next) => {
			return prev[next]
		}, vm.$data)
	}

	get (vm, expr) {
		Dep.target = this
		console.log('expr:::::', expr)
		let value = this.getValue(vm, expr)
		Dep.target = null
		return value
	}

	update () {
		let newValue = this.getValue(this.vm, this.expr)
		if (newValue != this.value) {
			this.cb(newValue)
		}
	}
}