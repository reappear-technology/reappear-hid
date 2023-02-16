<template>
	<el-row>
		<el-row style="padding:0px 10px;margin-top:10px">
			<el-tag size="small" style="width:100%">检测 HID 数量：{{hidData.length}}</el-tag>
		</el-row>
		<el-row :gutter="10" style="padding:10px 0px 0px 10px;width:100%;margin-bottom:10px">
			<el-col :span="20">
				<el-select :popper-append-to-body="false" :disabled="isInputData" @change="changHidData()" value-key="path" class="product-style" style="width:100%" size="small" v-model="hidValue" placeholder="请选择">
					<el-option
					v-for="(item,index) in hidData"
					:key="index"
					:label="item.path"
					:value="item"
					:title="item.path">
					</el-option>
				</el-select>
				<!-- <el-button class="item-remove" @click="getHidData()" type="info" plain style="width:100%" size="small" >读取数据</el-button> -->
			</el-col>
			<el-col :span="4">
				<el-button class="item-remove" :disabled="isInputData" @click="getHid()" type="primary" plain style="width:100%" size="small" >刷 新</el-button>
				<!-- <el-button class="item-remove" @click="getHidData()" type="info" plain style="width:100%" size="small" >读取数据</el-button> -->
			</el-col>
		</el-row>
		<el-row style="padding:0px 10px">
			<el-descriptions class="margin-top" :column="2" size="mini" border>
				<el-descriptions-item>
				<template slot="label">
					interface
				</template>
				{{hidValue.interface}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					manufacturer
				</template>
				{{hidValue.manufacturer}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					product
				</template>
				{{hidValue.product}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					productId
				</template>
				{{hidValue.productId}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					release
				</template>
				{{hidValue.release}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					usage
				</template>
				{{hidValue.usage}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					usagePage
				</template>
				{{hidValue.usagePage}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					vendorId
				</template>
				{{hidValue.vendorId}}
				</el-descriptions-item>
				<el-descriptions-item>
				<template slot="label">
					path
				</template>
				{{hidValue.path}}
				</el-descriptions-item>
			</el-descriptions>
		</el-row>
		<el-row style="padding:10px 10px;margin:0" :gutter="10">
			<el-col :span="19" style="padding-left: 0px;">
				<el-input
				type="textarea"
				:rows="11"
				size="small"
				placeholder="请输入内容"
				v-model="textarea1">
				</el-input>
			</el-col>
			<el-col :span="5" style="padding-right: 0px;">
				<el-button class="item-remove" :disabled="isInputData" @click="getFeatureReport()" type="primary" plain style="width:100%;margin-left:0px;" size="mini" >获取FEATURE报告</el-button>
				<el-button class="item-remove" :disabled="isInputData" @click="sendFeatureReport()" type="primary" plain style="width:100%;margin-left:0px;margin-top:5px" size="mini" >写入FEATURE报告</el-button>
				<el-button class="item-remove" :disabled="isInputData" @click="write()" type="primary" plain style="width:100%;margin-left:0px;margin-top:5px" size="mini" >写入OUTPUT报告</el-button>
				<el-button class="item-remove" :disabled="isInputData" @click="getdumpParse()" type="primary" plain style="width:100%;margin-left:0px;margin-top:5px" size="mini" >解析描述符</el-button>
			</el-col>
		</el-row>
		<el-row style="padding:0px 10px;margin:0" :gutter="10">
			<el-col :span="19" style="padding-left: 0px;">
				<el-input
				type="textarea"
				:rows="12"
				size="small"
				placeholder="输出结果"
				v-model="textarea2">
				</el-input>
			</el-col>
			<el-col :span="5" style="padding-right: 0px;text-align: center;">
				<el-button class="item-remove" @click="getHidData()" type="primary" style="width:100%;margin-left:0px;" size="mini" >{{isInputData?'停止读取':'读取INPUT报告'}}</el-button>
				<el-button class="item-remove" :disabled="isInputData" @click="getdump()" type="primary" style="width:100%;margin-left:0px;margin-top:5px" size="mini" >获取所有设备描述符</el-button>
				<el-button class="item-remove" :disabled="isInputData" @click="getHidDeviceInfo()" type="primary" style="width:100%;margin-left:0px;margin-top:5px" size="mini" >获取设备信息</el-button>
				<img class="imglogo" src="@/assets/u19.png" alt="">
			</el-col>
		</el-row>
	</el-row>
	
</template>
<script>
import LicenseMon from '@/components/dashboard/LicenseMon'
import Configuration from '@/components/dashboard/Configuration'
import Management from '@/components/dashboard/Management'
import Macburn from '@/components/dashboard/Macburn'
import Regular from '@/utils/regular'
import { ipcRenderer } from 'electron'
const usb = require('usb')
const { SerialPort } = require('serialport')
export default {
	name: 'Dashboard',
	data() {
		return {
			isInputData:false,
			textarea2:"",
			textarea1:"0x00 0x01 0x01 0x05 0xff 0xff",
			devices:"",
			butNow:1,
			radioNow:0,
			menuNum:"1",
			activeName: '2',
			gridDevices:"",
			isOver:"",
			editModeEnabled: true,
			currentDevices: [],
			selectedDevices: [],
			ip: '10.0.0.',
			wirelessDevices: [],
			deletedEvent: false,
			stoppedNotify: false,
			firstLoad: true,
			wired: '',
			wireless: '',
			sendTime:null,
			hidData:[],
			hidValue:{}
		}
	},
	components: {
		LicenseMon,
		Configuration,
		Management,
		Macburn,
		wireless:"",
		wired:""
	},
	mounted(){
		this.getHid()
		let _this = this
		usb.usb.on('attach', function(device) {
			_this.getHid()
			console.log("插进去");
			JSON.stringify
		});
		usb.usb.on('detach', function(device) { 
			_this.getHid()
			console.log("拔出来");
		});
	},
	created(){
		ipcRenderer.on('hidDevices', (event, _devices) => {
			console.log("获取所有Hid设备",_devices);
			this.hidData = _devices
			if(this.hidData.length>0){
				this.hidValue=this.hidData[0]
			}
		})
		ipcRenderer.on('featureReport', (event, _data) => {
			this.textarea2=_data
		})
		ipcRenderer.on('deviceInfo', (event, _data) => {
			this.textarea2=JSON.stringify(_data)
		})
		ipcRenderer.on('dumpInfo', (event, _data) => {
			this.textarea2=this.textarea2+_data
		})
		ipcRenderer.on('offData', (event, _data) => {
			this.isInputData=false
		})
		ipcRenderer.on('errorDevices', (event, _data) => {
			this.$notify.error({title: '提示',message: _data,offset: 40})
		})
		ipcRenderer.on('hidData', (event, _data) => {
			this.textarea2=this.textarea2+_data+'\n'
		})
		ipcRenderer.on('reportData', (event, _reportData) => {
			console.log("获取报告",_reportData);
		})
		this.wireless = '无线'
		this.wired = '有线'
		const { wireless, wired } = this
		this.wirelessDevices = []
		ipcRenderer.on('devices', (event, _devices) => {

			const preDevicesCount = this.currentDevices.length
			const devices = _devices
				.filter(({ id }, idx) => _devices.findIndex((device) => id === device.id) === idx)
				.map(({ id }) => ({ id, name: id, method: Regular('ip', id) ? wireless : wired }))

			this.currentDevices = devices
			const preWirelessDevicesCount = this.wirelessDevices.length
			this.currentDevices.forEach(({ id, name, method }) => {
				if (method === wired) {
					return
				}
				if (this.wirelessDevices.every((device) => id !== device.id)) {
					this.wirelessDevices.push({ id, name })
				}
			})
			console.log("获取到设备",this.currentDevices);
			preWirelessDevicesCount !== this.wirelessDevices.length
			if (this.firstLoad) {
				this.firstLoad = false
				this.$notify.success({title: '提示',message: '正在加载设备',offset: 40})
			} else if (!this.stoppedNotify && preDevicesCount > this.currentDevices.length) {
				this.$notify.info({title: '提示',message: '设备发生变动',offset: 40})
			} else if (!this.stoppedNotify && preDevicesCount < this.currentDevices.length) {
				this.$notify.success({title: '提示',message: '检测到新设备',offset: 40})
			}
			
		})

		const opened = {}
		ipcRenderer.on('open', (_, id) => {
			if (!opened[id]) {
				opened[id] = true
				setTimeout(() => {
					this.$notify.success({title: '提示',message: `已成功開啟${id}`,offset: 40})
				}, 500)
				setTimeout(() => {
					opened[id] = false
				}, 1000)
			}
		})

		const closed = {}
		ipcRenderer.on('close', (_, { success, id }) => {
			if (!closed[id]) {
				closed[id] = true
				const result = success ? '操作成功！' : '操作失败！'
				this.$notify.success({title: '提示',message: result,offset: 40})
				setTimeout(() => {
					closed[id] = false
				}, 1000)
			}
		})

		ipcRenderer.on('error', (_, { type }) => {
			this.$notify.error({title: '提示',message: "出错了！",offset: 40})
		})
	},
	methods:{
		//写入input报告
		write(){
			ipcRenderer.send('write',{hidDump:this.textarea1})
		},
		//读取Feature报告
		getFeatureReport(){
			ipcRenderer.send('getFeatureReport',{hidDump:this.textarea1})
		},
		//写入Feature报告
		sendFeatureReport(){
			ipcRenderer.send('sendFeatureReport',{hidDump:this.textarea1})
		},
		//解析描述符
		getdumpParse(){
			this.textarea2=""
			ipcRenderer.send('getdumpParse',{hidDump:this.textarea1})
		},
		//获取描述符
		getdump(){
			this.textarea2=""
			ipcRenderer.send('getdump')
		},
		//获取设备信息
		getHidDeviceInfo(){
			ipcRenderer.send('hidDeviceInfo')
		},
		//切换设备
		changHidData(){
			ipcRenderer.send('switchHidData',{ path: this.hidValue.path })
		},
		//获取连接的HID数据
		getHidData(){
			if(this.isInputData){
				ipcRenderer.send('offHidData')
				this.isInputData=false
			}else{
				this.textarea2=""
				ipcRenderer.send('onHidData')
				this.isInputData=true
			}
			
		},
		//获取HID
		getHid(){
			ipcRenderer.send('getHid')
		},
		//连接无线设备
		connect() {
			if (!Regular('ip', this.ip)) {
				this.$notify.error({title: '提示',message: "请输入正确的 IP 地址",offset: 40})
				return
			}
			const device = this.currentDevices.find(({ id }) => id === this.ip || id.split(':')[0] === this.ip)
			if (device) {
				this.$notify.warning({title: '提示',message: device.name+"已经连接",offset: 40})
				return
			}
			const wireDevice = this.currentDevices.filter(({ method }) => method === this.wired)[0]
			const openedIP = this.ip
			ipcRenderer.send('connect', { id: wireDevice ? wireDevice.id : null, ip: this.ip })

			this.stoppedNotify = true
			this.$notify.info({title: '提示',message: "正在开启无线连接...",offset: 40})
			setTimeout(() => {
				if (this.currentDevices.every(({ id }) => id !== openedIP && id.split(':')[0] !== openedIP)) {
					this.$notify.error({title: '提示',message: '开启无线连接失败',offset: 40})
				} else {
					this.$notify.success({title: '提示',message: '已成功打开无线连接',offset: 40})
				}
			}, 1000)
			setTimeout(() => {
				this.stoppedNotify = false
			}, 2000)
		},
		//选中菜单
		setButNow(index){
			this.butNow=index	
		},
		//选中设备
		setRadio(index){
			this.radioNow=index
		},
	}
}
</script>
<style lang="scss">
.product-style {
	.el-select-dropdown{
		left: 0px !important;
		width: 400px !important;
		.el-select-dropdown__item {
			width: calc(100% - 10px);
			display: inline-block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	
}	
.dashbox-devcard-yes{
	color: #fff !important;
    background-color: #909399 !important;
    border-color: #909399 !important;
}
.dashbox-devcard{
	margin-bottom: 5px;
	color: #909399;
    background: #f4f4f5;
    border-color: #d3d4d6;
	cursor: pointer;
	span{
		font-size: 12px;
		margin-left: 3px;
	}
	.el-card__body{
		padding: 6px 10px;
	}
}
.dashbox-devcard:hover{
	color: #fff;
    background-color: #909399;
    border-color: #909399;
}
</style>
<style lang="scss" scoped>
.imglogo{
	width: 130px;
	margin: 0 auto;
	margin-top: 80px;
}
.el-collapse-item__header{
	height: 32px;
    line-height: 32px;
}
.dashbox{
	height: calc(100vh - 40px);
	.dashbox-aside{
		background-color: #202020;
		box-shadow: 0 2px 12px 0 #0000001a;
		border: 2px solid #646464;
		.dashbox-asidetitle{
			padding: 5px;
			border-bottom: 2px solid #646464;
			text-align: center;
			span{
				color: #FFF;
				font-size: 14px;
			}
		}
		.dashbox-asidetitle-bottom{
			padding: 5px;
			border-top: 2px solid #646464;
			text-align: center;
			bottom: 0;
			position: absolute;
			width: 228px;
			span{
				font-size: 12px;
				color: #6b6b6b;
			}
		}
	}
	.dashbox-main{
		background-color: #202020;
		.top-btn{
			font-size: 15px;
			color: #555555;
			padding: 10px;
			cursor: pointer;
		}
		.top-btn-yes{
			box-sizing: border-box;
			color: #FFF;
			border-bottom: 2px solid #409eff;
		}
		.top-btn:hover{
			box-sizing: border-box;
			color: #FFF;
			border-bottom: 2px solid #409eff;
		}
	}
	
}
</style>
