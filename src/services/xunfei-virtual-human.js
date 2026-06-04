const WebSocket = require("ws");
const crypto = require("crypto");
const axios = require("axios");
const config = require("../config");

class XunfeiVirtualHuman {
    constructor() {
        this.config = {
            host: config.xfyun.vmsHost || "vms.cn-huadong-1.xf-yun.com",
            port: 443,
            appId: config.xfyun.appId,
            apiKey: config.xfyun.apiKey,
            apiSecret: config.xfyun.apiSecret
        };
        this.ws = null;
        this.sessionId = null;
        this.avatarId = "110017009";
        this.onMessage = null;
        this.onError = null;
        this.onClose = null;
        this.isConnected = false;
        this.isMock = false;

        this.avatars = {
            泽林: "110017009",
            伊凡: "110026013",
            依丹: "118801001",
            晓娴: "110021004",
            晓云: "110022005"
        };
    }

    generateAuthorization(host, date, requestLine) {
        const signatureOrigin = `${host}\n${date}\n${requestLine}`;
        const signature = crypto.createHmac("sha256", this.config.apiSecret).update(signatureOrigin).digest("base64");

        const authorizationOrigin = `api_key="${this.config.apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
        return Buffer.from(authorizationOrigin).toString("base64");
    }

    async startSession(avatarId = "110017009") {
        this.avatarId = avatarId;

        const date = new Date().toUTCString();
        const requestLine = "POST /v1/private/vms2d_start HTTP/1.1";
        const authorization = this.generateAuthorization(this.config.host, date, requestLine);

        const url = `https://${this.config.host}/v1/private/vms2d_start`;

        const params = new URLSearchParams({
            host: this.config.host,
            date: date,
            authorization: authorization
        });

        const response = await axios.post(
            `${url}?${params.toString()}`,
            {
                app_id: this.config.appId,
                avatar_id: this.avatarId,
                width: 720,
                height: 405,
                audio: true,
                video: true
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        return response.data;
    }

    async controlSession(sessionId, text) {
        const date = new Date().toUTCString();
        const requestLine = "POST /v1/private/vms2d_ctrl HTTP/1.1";
        const authorization = this.generateAuthorization(this.config.host, date, requestLine);

        const url = `https://${this.config.host}/v1/private/vms2d_ctrl`;

        const params = new URLSearchParams({
            host: this.config.host,
            date: date,
            authorization: authorization
        });

        const response = await axios.post(
            `${url}?${params.toString()}`,
            {
                app_id: this.config.appId,
                session_id: sessionId,
                text: text,
                end: 1
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        return response.data;
    }

    async stopSession(sessionId) {
        const date = new Date().toUTCString();
        const requestLine = "POST /v1/private/vms2d_stop HTTP/1.1";
        const authorization = this.generateAuthorization(this.config.host, date, requestLine);

        const url = `https://${this.config.host}/v1/private/vms2d_stop`;

        const params = new URLSearchParams({
            host: this.config.host,
            date: date,
            authorization: authorization
        });

        const response = await axios.post(
            `${url}?${params.toString()}`,
            {
                app_id: this.config.appId,
                session_id: sessionId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        return response.data;
    }

    async connect(avatarId = "110017009", callback) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("连接超时，已超过15秒"));
            }, 15000);

            this.startSession(avatarId)
                .then(result => {
                    clearTimeout(timeout);

                    if (result && result.code === 0 && result.data && result.data.session_id) {
                        this.sessionId = result.data.session_id;
                        this.isConnected = true;
                        console.log("虚拟人会话已建立:", this.sessionId);

                        const wsUrl = `wss://${this.config.host}/v1/private/vms2d_audio_ctrl?app_id=${this.config.appId}&session_id=${this.sessionId}`;
                        this.ws = new WebSocket(wsUrl);

                        this.ws.on("open", () => {
                            console.log("虚拟人WebSocket连接成功");
                        });

                        this.ws.on("message", data => {
                            try {
                                if (data instanceof Buffer) {
                                    if (this.onMessage) {
                                        this.onMessage({ type: "binary", data: data });
                                    }
                                } else {
                                    const message = typeof data === "string" ? JSON.parse(data) : data;
                                    console.log("收到虚拟人消息:", message.type || "unknown");

                                    if (message.type === "message" || message.data) {
                                        if (this.onMessage) {
                                            this.onMessage(message.data || message);
                                        }
                                        if (callback) callback(null, message.data || message);
                                    }
                                }
                            } catch (error) {
                                console.error("解析消息失败:", error);
                            }
                        });

                        this.ws.on("error", error => {
                            console.error("WebSocket错误:", error);
                            if (this.onError) {
                                this.onError(error);
                            }
                        });

                        this.ws.on("close", (code, reason) => {
                            console.log("WebSocket连接关闭:", code, reason.toString());
                            this.isConnected = false;
                            if (this.onClose) {
                                this.onClose(code, reason);
                            }
                        });

                        resolve({
                            session_id: this.sessionId,
                            avatar_id: this.avatarId,
                            avatar_name: this.getAvatarNameById(this.avatarId)
                        });
                    } else {
                        const errorMsg = result?.desc || "启动会话失败";
                        reject(new Error(`启动会话失败: ${errorMsg} (code: ${result?.code})`));
                    }
                })
                .catch(error => {
                    clearTimeout(timeout);
                    console.error("启动虚拟人会话失败:", error.message);
                    reject(error);
                });
        });
    }

    sendMessage(text, callback) {
        if (!this.sessionId) {
            callback(new Error("请先建立会话"));
            return;
        }

        this.controlSession(this.sessionId, text)
            .then(result => {
                if (result && result.code === 0 && result.data) {
                    if (this.onMessage) {
                        this.onMessage(result.data);
                    }
                    if (callback) callback(null, result.data);
                } else {
                    const errorMsg = result?.desc || "发送消息失败";
                    callback(new Error(`发送消息失败: ${errorMsg}`));
                }
            })
            .catch(error => {
                if (callback) callback(error);
            });
    }

    disconnect() {
        if (this.sessionId) {
            this.stopSession(this.sessionId).catch(() => {});
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.isConnected = false;
    }

    async getVideoStream() {
        if (!this.sessionId) {
            throw new Error("请先建立会话");
        }
        return `wss://${this.config.host}/v1/private/vms2d_audio_ctrl?app_id=${this.config.appId}&session_id=${this.sessionId}`;
    }

    getAvatarNameById(avatarId) {
        for (const [name, id] of Object.entries(this.avatars)) {
            if (id === avatarId) return name;
        }
        return "未知";
    }

    getAvailableAvatars() {
        return this.avatars;
    }
}

module.exports = XunfeiVirtualHuman;
