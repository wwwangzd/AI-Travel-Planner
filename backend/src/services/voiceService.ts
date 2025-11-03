import CryptoJS from 'crypto-js';
import WebSocket from 'ws';

export class XFVoiceService {
    private appId: string;
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.appId = process.env.XF_APP_ID!;
        this.apiKey = process.env.XF_API_KEY!;
        this.apiSecret = process.env.XF_API_SECRET!;

        if (!this.appId || !this.apiKey || !this.apiSecret) {
            throw new Error('XunFei credentials are not set');
        }
    }

    async recognize(audioBase64: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const url = this.getWebSocketUrl();
            const ws = new WebSocket(url);
            let result = '';

            ws.on('open', () => {
                const params = {
                    common: { app_id: this.appId },
                    business: {
                        language: 'zh_cn',
                        domain: 'iat',
                        accent: 'mandarin'
                    },
                    data: {
                        status: 2,
                        format: 'audio/L16;rate=16000',
                        encoding: 'raw',
                        audio: audioBase64
                    }
                };
                ws.send(JSON.stringify(params));
            });

            ws.on('message', (data: WebSocket.Data) => {
                const response = JSON.parse(data.toString());

                if (response.code !== 0) {
                    ws.close();
                    reject(new Error(`XunFei API Error: ${response.message}`));
                    return;
                }

                if (response.data && response.data.result) {
                    const ws_result = response.data.result.ws;
                    ws_result.forEach((item: any) => {
                        item.cw.forEach((word: any) => {
                            result += word.w;
                        });
                    });
                }

                if (response.data && response.data.status === 2) {
                    ws.close();
                    resolve(result);
                }
            });

            ws.on('error', (error) => {
                reject(error);
            });

            ws.on('close', () => {
                if (!result) {
                    reject(new Error('WebSocket closed without result'));
                }
            });
        });
    }

    private getWebSocketUrl(): string {
        const host = 'iat-api.xfyun.cn';
        const path = '/v2/iat';
        const date = new Date().toUTCString();

        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signature = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
        const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);

        const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureBase64}"`;
        const authorization = Buffer.from(authorizationOrigin).toString('base64');

        return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
    }
}

export const xfVoiceService = new XFVoiceService();
