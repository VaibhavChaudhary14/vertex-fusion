import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { NeoBox } from './NeoComponents';
import { motion } from 'framer-motion';

interface DataPoint {
    time: number;
    value: number;
}

interface WaveformProps {
    data: DataPoint[];
    color: string;
    title: string;
    isGlitching?: boolean;
}

export const WaveformGraph = ({ data, color, title, isGlitching }: WaveformProps) => {

    // Neo-Brutalism requires thick strokes and bold dots.

    return (
        <motion.div
            animate={isGlitching ? { x: [-2, 2, -1, 1, 0], y: [1, -1, 0] } : {}}
            transition={{ duration: 0.2, repeat: isGlitching ? Infinity : 0 }}
            className="h-full w-full"
        >
            <NeoBox className="h-64 w-full p-2 relative overflow-hidden">
                {/* Background Grid Lines (CSS based for raw look) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <h3 className="font-mono font-bold mb-2 uppercase border-b-2 border-black inline-block bg-white relative z-10 px-2">
                    {title}
                </h3>

                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={data}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip
                            contentStyle={{ border: '2px solid black', boxShadow: '4px 4px 0 0 black', borderRadius: 0, fontFamily: 'monospace' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2, fill: 'white' }}
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {isGlitching && (
                    <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-20 flex items-center justify-center">
                        <h1 className="text-4xl font-black text-red-600 rotate-12 border-4 border-red-600 p-4 bg-white/80">
                            SIGNAL DISTORTION DETECTED
                        </h1>
                    </div>
                )}
            </NeoBox>
        </motion.div>
    );
};
