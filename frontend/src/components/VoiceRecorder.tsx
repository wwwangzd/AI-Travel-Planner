import React, { useState, useRef } from 'react';
import { Button, Progress, message } from 'antd';
import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // 开始计时
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 60) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            message.error('无法访问麦克风，请检查权限设置');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="voice-recorder">
            <div className="recorder-content">
                {isRecording ? (
                    <>
                        <div className="recording-indicator">
                            <div className="pulse-circle" />
                            <AudioOutlined className="recording-icon" />
                        </div>
                        <div className="recording-info">
                            <p className="recording-text">正在录音...</p>
                            <p className="recording-time">{formatTime(recordingTime)}</p>
                            <Progress
                                percent={(recordingTime / 60) * 100}
                                showInfo={false}
                                strokeColor="#667eea"
                            />
                        </div>
                        <Button
                            type="primary"
                            danger
                            size="large"
                            icon={<StopOutlined />}
                            onClick={stopRecording}
                            className="control-button"
                        >
                            停止录音
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="recorder-placeholder">
                            <AudioOutlined className="placeholder-icon" />
                            <p className="placeholder-text">点击开始录音</p>
                            <p className="placeholder-hint">最长60秒</p>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<AudioOutlined />}
                            onClick={startRecording}
                            className="control-button"
                        >
                            开始录音
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceRecorder;
