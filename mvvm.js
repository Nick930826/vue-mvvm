class MVVM {
	constructor (options) {
		// 一上来，先把可用的属性挂载到实例上
		this.$el = options.el
		this.$data = options.data

		// 如果有要编译的模板执行编译
		if (this.$el) {
			this.proxy(this.$data)
			// 数据劫持，把对象的所有属性改成get和set方法
			new Observer(this.$data)
			// 编译
			new Compile(this.$el, this)
		}
	}

	proxy (data) {
		Object.keys(data).forEach(key => {
			Object.defineProperty(this, key, {
				get () {
					return data[key]
				},
				set(newValue) {
					if (newValue != data[key]) {
						data[key] = newValue
					}
				}
			})
		})
	}
}