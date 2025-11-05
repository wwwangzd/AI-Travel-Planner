import request from '../utils/request';
import type { ApiResponse } from '../types';

export interface VoiceRecognitionResult {
    text: string;
    confidence: number;
}

export const voiceApi = {
    // 语音识别
    recognize: (audioFile: File) => {
        const formData = new FormData();
        formData.append('audio', audioFile);

        return request.post<any, ApiResponse<VoiceRecognitionResult>>(
            '/api/voice/recognize',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    },
};
