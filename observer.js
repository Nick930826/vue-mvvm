class Observer {
	constructor (data) {
		this.observer(data)
	}

	observer (data) {
		if (!data || typeof(data) != 'object') {
			return
		}

		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
			this.observer(data[key])
		})
	}

	defineReactive (obj, key, value) {
		let dep = new Dep()
		let that = this
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get() {
				Dep.target && dep.addSubs(Dep.target)
				return value
			},
			set(newValue) {
				if (newValue != value) {
					// 先替换value内容，再进行通知，这样watch内部update方法才能获取到最新的newValue
					// 如果是对象持续劫持
					that.observer(newValue)
					value = newValue
					dep.notifiy()
				}
			}
		})
	}
}

class Dep {
	constructor () {
		this.subs = []
	}

	addSubs (watcher) {
		this.subs.push(watcher)
	}

	notifiy () {
		this.subs.forEach(watcher => watcher.update())
	}
}





