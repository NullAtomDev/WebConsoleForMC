//const WsMessageData=require("./WsMessageData");
class WsMessage {
    constructor() {
        this.message = {};
    }

    create(rowData) {
        let type = typeof rowData;
        let data = rowData;
        if (type === 'string') {
            // JSON字符串
            try {
                data = JSON.parse(rowData);
            } catch (e) {
                return false;
            }
        }
        console.log(rowData);
        if ( typeof data.type !=='string' || typeof data.data !== 'object') {
            return false;
        }
        this.message = new WsMessageData(data);
        return true;
    }

    getMessageAsJson(type = null, data = null) {
        if (type === null) {
            return JSON.stringify(this.message);
        }
        return JSON.stringify({
            type: type,
            data: data
        });
    }

    getType(){
        return this.message.type;
    }

    getData(){
        return this.message.data;
    }

}

//module.exports = WsMessage;
