import { app} from 'electron'
var HID = require('node-hid');
var iconvLite = require('iconv-lite');
var device;
const getHidDev = sender => {
    var devices = HID.devices();
    try {
        //连接了设备
        device = new HID.HID( devices[0].path );
        sender.sender.send('hidDevices', devices)
        device.on('error', function(err) {
            sender.sender.send('errorDevices', err)
        });
    } catch (error) {
        sender.sender.send('hidDevices', devices)
    }
}
const switchHidData = ({ sender }, args) => {
    const { path } = args
    if(device){
        device.close()
    }
    device = new HID.HID( path );
    device.on('error', function(err) {
        sender.send('errorDevices', err)
    });
    console.log("切换了设备",device);
}

const getFeatureReport = ({ sender }, args) => {
    const { hidDump } = args
    let dump = hidDump.replace(/\s/g,",").replace(/,,,,,/g,",").replace(/,,,,/g,",").replace(/,,,/g,",").replace(/,,/g,","); //replace all.replace(/\n/g,",")
    if(dump.slice(0, 1)==','){
        dump=dump.slice(1)
    }
    if(dump.substr(-1)==','){
        dump=dump.slice(0,dump.length-1)
    }
    let dumpArr = dump.split(",")
    var buf = device.getFeatureReport(dumpArr[0],dumpArr[1])
    sender.send('featureReport', buf)
    device.on('error', function(err) {
        sender.send('errorDevices', err)
    });
}

const write = ({ sender }, args) => {
    const { hidDump } = args
    let dump = hidDump.replace(/\s/g,",").replace(/,,,,,/g,",").replace(/,,,,/g,",").replace(/,,,/g,",").replace(/,,/g,","); //replace all.replace(/\n/g,",")
    if(dump.slice(0, 1)==','){
        dump=dump.slice(1)
    }
    if(dump.substr(-1)==','){
        dump=dump.slice(0,dump.length-1)
    }
    let dumpArr = dump.split(",")
    let data = new Buffer.from(dumpArr)
    device.write(data)
    device.on('error', function(err) {
        sender.send('errorDevices', err)
    });
}

const sendFeatureReport = ({ sender }, args) => {
    const { hidDump } = args
    let dump = hidDump.replace(/\s/g,",").replace(/,,,,,/g,",").replace(/,,,,/g,",").replace(/,,,/g,",").replace(/,,/g,","); //replace all.replace(/\n/g,",")
    if(dump.slice(0, 1)==','){
        dump=dump.slice(1)
    }
    if(dump.substr(-1)==','){
        dump=dump.slice(0,dump.length-1)
    }
    let dumpArr = dump.split(",")
    let data = new Buffer.from(dumpArr)
    device.sendFeatureReport(data)
    device.on('error', function(err) {
        sender.send('errorDevices', err)
    });
}

const getdumpParse = ({ sender }, args) => {
    const { hidDump } = args
    let dump = hidDump.replace(/\s/g,",").replace(/,,,,,/g,",").replace(/,,,,/g,",").replace(/,,,/g,",").replace(/,,/g,","); //replace all.replace(/\n/g,",")
    if(dump.slice(0, 1)==','){
        dump=dump.slice(1)
    }
    if(dump.substr(-1)==','){
        dump=dump.slice(0,dump.length-1)
    }
    let dumpArr = dump.split(",")
    const hidparse = require('node-hid-parse')
    let find = hidparse.find
    let parse = hidparse.parse
    let data = new Buffer.from(dumpArr)
    console.log("获取",data);
    let report = parse(data)
    console.log("获取1",JSON.stringify(find(report, 0xff86, 0x00fc), null, 2))
    console.log("获取2",JSON.stringify(find(report, 0xff86, 0x00fd), null, 2))
}

const getdump = sender => {
    const cmdexe = require('node-cmd');
    const childProcess = require('child_process');
    const exec = childProcess.exec
    const path = require('path');
//   // 获取安装目录（也就是文件安装目录中exe文件的目录）--打包
//   let homeDir = path.dirname(app.getPath('module'))

    // // 获取安装目录（也就是文件安装目录中exe文件的目录）--开发
    let homeDir = (app.getAppPath()).slice(0, -14)
    let slmgr = homeDir + `\\extraResources\\winhiddump.exe`
    let child = childProcess.spawn(slmgr)
    child.stdout.on('data',(data)=>{
        sender.sender.send('dumpInfo', data.toString())
    })
    child.stderr.on('data',(data)=>{
        console.log("出错了",data.toString());
    })
}

const getHidDeviceInfo = sender => {
    var buf = device.getDeviceInfo()
    sender.sender.send('deviceInfo', buf)
}

const offHidData = sender => {
    device.pause()
    sender.sender.send('offData', "1")
}

const onHidData = sender => {

    var buf = device.getDeviceInfo()
    // var buf2 = device.getFeatureReport(0x07,504)
    console.log("getDeviceInfo",buf);
    // let command = [
    //     0x00, // first byte is reportId (zero if no report id used)
    //     0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    // ];
    device.on('data', function(data) {
        console.log("没法送？",data);
        // sender.sender.send('hidData', data.toString('hex'))
        sender.sender.send('hidData', data)
    });
    device.on('error', function(err) {
        console.log("没法送？2",data);
        sender.send('errorDevices', err)
    });
    // device.write(command)
    // device.sendFeatureReport( [0x00, 0x01, 0x01, 0x05, 0xff, 0xff] )
    // device.on("data",function(data){
    //     console.log(data);
    // })
    // let lenss = Buffer.from(buf2)
    // let model = iconvLite.decode(lenss, 'utf8')
    // console.log("报告是啥",model);
    // sender.sender.send('reportData', buf2)
}

export default {
	getHidDev,onHidData,offHidData,getHidDeviceInfo,switchHidData,getdump,getdumpParse,sendFeatureReport,getFeatureReport,write
}