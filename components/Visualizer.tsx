
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
    isActive: boolean;
    stream: MediaStream | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, stream }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const audioContextRef = useRef<AudioContext>();
    const analyserRef = useRef<AnalyserNode>();

    useEffect(() => {
        if (isActive && stream) {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                if (!canvasRef.current || !analyserRef.current) return;

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 60;

                // Draw decorative outer pulse
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                const pulse = average * 0.5;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(59, 130, 246, ${Math.min(0.5, average / 128)})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw frequency bars in a circle
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * 40;
                    const angle = (i * 2 * Math.PI) / bufferLength;

                    const x1 = centerX + Math.cos(angle) * radius;
                    const y1 = centerY + Math.sin(angle) * radius;
                    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = `hsl(${(i * 360) / bufferLength}, 70%, 60%)`;
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }

                animationRef.current = requestAnimationFrame(draw);
            };

            draw();
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);

            if (audioContextRef.current) {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
                audioContextRef.current = undefined;
            }

            // Clear canvas when inactive
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
                audioContextRef.current = undefined;
            }
        };
    }, [isActive, stream]);

    return (
        <div className="relative w-full h-48 flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="w-full h-full"
            />
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-700 border-dashed animate-spin-slow"></div>
                </div>
            )}
        </div>
    );
};

export default Visualizer;
