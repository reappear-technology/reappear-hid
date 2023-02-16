var adb = require('adbkit')
var client = adb.createClient()
const debug = require('debug')('scrcpy')

const onDevices = sender => {
	client.trackDevices()
		.then(function (tracker) {
			tracker.on('add', function (device) {
				debug('设备 %s 插入', device.id)
				client.listDevices().then(function (devices) {
					debug(devices)
					sender.send('devices', devices)
				})
			})
			tracker.on('remove', function (device) {
				debug('设备 %s 拔出', device.id)
				client.listDevices().then(function (devices) {
					debug(devices)
					sender.send('devices', devices)
				})
			})
			tracker.on('end', function () {
				debug('停止')
			})
		})
		.catch(function (err) {
			debug('出现了问题:', err.stack)
		})
}

const connect = ({ sender }, args) => {
	const { id, ip } = args
	const success = '已成功打开无线连接'
	const fail = '无法打开无线连接'
	if (id) {
		client.tcpip(id)
			.then(function (port) {
				client.connect(ip, port).then(function (err) {
					if (err) {
						sender.send('connect', { success: false, message: fail })
						return
					}
					sender.send('connect', { success: true, message: success })
				}).catch(() => {
					sender.send('connect', { success: false, message: fail })
				})
			}).catch(() => {
				client.connect(ip).then(function (err) {
					if (err) {
						sender.send('connect', { success: false, message: fail })
						return
					}
					sender.send('connect', { success: true, message: success })
				}).catch(() => {
					sender.send('connect', { success: false, message: fail })
				})
			})
	} else {
		client.connect(ip).then(function (err) {
			if (err) {
				sender.send('connect', { success: false, message: fail })
				return
			}
			sender.send('connect', { success: true, message: success })
		}).catch(() => {
			sender.send('connect', { success: false, message: fail })
		})
	}
}

const disconnect = ({ sender }, ip) => {
	client.disconnect(ip).then(id => {
		debug(id)
		sender.send('connect', { success: false, message: '设备关闭成功' })
	}).catch(err => {
		debug(err)
		sender.send('connect', { success: false, message: '设备关闭失败' })
	})
}

const getProperties = ({ sender }, id) => {
	client.getProperties(id).then(res => {
		// console.log("获取到设备信息",res);
		sender.send('properties', { success: false, message: '获取设备信息成功' })
	}).catch(err => {
		debug(err)
		sender.send('properties', { success: false, message: '获取设备信息失败' })
	})
}

const pushDevices = ({ sender }, args) => {
	const { path, id } = args
	console.log("没进来？",id);
	client.push(id, path, '/data/local/tmp/foo.txt').then(transfer => {
		return new Promise(function(resolve, reject) {
			transfer.on('progress', function(stats) {
				console.log('[%s] 推送 %d 多少个字节',
				id,
				stats.bytesTransferred)
			})
			transfer.on('end', function() {
				console.log('[%s] 推送完毕', id)
				resolve()
			})
			transfer.on('error', reject)
		})
	}).catch(err => {
		console.log("err",err);
		debug(err)
		// sender.send('properties', { success: false, message: '获取设备信息失败' })
	})
}

export default {
	connect, disconnect, onDevices, getProperties,pushDevices
}