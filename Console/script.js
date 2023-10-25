const {spawn} = require('child_process');
const {WebSocketServer} = require("ws");
const fs = require('fs');
const crypto = require('crypto');
const WsMessage = require("./WsMessage");

// TODO 完善子进程类
const wss = new WebSocketServer({port: 8080});

const PASSWORD = fs.readFileSync('PASSWORD').toString().replace(/^\s+|\s+$/g, '');;

let TOKEN = crypto.createHash('md5').update(PASSWORD).digest('hex');

let CONNECTION = null;

let childProcess = null;

startMC();

// ws
// TODO 心跳包
wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    // 确保只有一个连接
    CONNECTION?.close();
    CONNECTION = ws;
    // 获取 TOKEN 进行鉴权
    if (req.headers['sec-websocket-protocol'] !== TOKEN) {
        ws.close();
        return;
    }
    ws.on('message', (message) => {
        message = message.toString();
        // 在这里处理WebSocket客户端发送的消息
        let Message = new WsMessage();
        if (!Message.create(message)) {
            return;
        }
        // TODO 完善的鉴权服务
        switch (Message.getType()) {
            // case 'login':
            //     if (Message.getData().password !== PASSWORD) {
            //         return;
            //     }
            //     TOKEN = makeToken();
            //     wss.send(Message.getMessageAsJson('token', {
            //         token: TOKEN
            //     }));
            //     return;
            case 'cmd':
                Message.getData().cmd.forEach((e) => {
                    childProcess.stdin.write(`${e}\n`); // TODO 执行失败的处理
                    console.log(`${e}\n`);
                });
                break;
            case 'operation':
                let cmd = Message.getData().cmd;
                switch (cmd){
                    case 'restart':
                        startMC();
                        break;
                }
                break;
            case 'ping':

                break;
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

function startMC() {
    // MC进程
    // 输出管道
    childProcess = spawn('MC/bedrock_server.exe');
    childProcess.stdout.on('data', (data) => {
        console.log(`Child Process STDOUT: ${data}`);
        let message = new WsMessage();
        CONNECTION?.send(message.getMessageAsJson('stdout', {
            stdout: [
                data.toString()
            ]
        }));
    });
    // 报错管道
    childProcess.stderr.on('data', (data) => {
        console.error(`Child Process STDERR: ${data}`);
    });
    // 关闭管道
    childProcess.on('close', (code) => {
        console.log(`Child Process exited with code ${code}`);
    });
}
// function makeToken() {
//     return crypto.createHash('md5')
//         .update(PASSWORD + Date.now() + Math.random())
//         .digest('hex');
// }
