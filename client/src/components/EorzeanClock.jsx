import { useState, useEffect } from 'react';
import { getCurrentEorzeanTime, formatET12h } from '../utils/eorzeanTime';

export default function EorzeanClock({ compact }) {
    const [time, setTime] = useState(getCurrentEorzeanTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getCurrentEorzeanTime());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const minuteProgress = (time.minutes / 60) * 100;
    const isDaytime = time.hours >= 6 && time.hours < 18;

    // Format for main display (without seconds)
    const mainTime = formatET12h(time.hours, time.minutes);

    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-900/50 border border-gray-700/50">
                <span className="text-base" title={isDaytime ? 'Day Time' : 'Night Time'}>
                    {isDaytime ? '☀️' : '🌙'}
                </span>
                <div className="flex items-baseline gap-1 font-mono leading-none">
                    <span className="text-gray-100 font-semibold">{mainTime}</span>
                    <span className="text-xs text-gray-500">:{time.seconds.toString().padStart(2, '0')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Eorzean Time
                </h2>
                <div className="text-xs text-gray-600">
                    1 bell = 2m 55s
                </div>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="eorzea-clock">
                    {mainTime}
                </span>
                <span className="clock-seconds">
                    :{time.seconds.toString().padStart(2, '0')}
                </span>
            </div>

            {/* Bell progress bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Bell Progress</span>
                    <span className="text-gold">{Math.round(minuteProgress)}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill transition-all duration-1000"
                        style={{ width: `${minuteProgress}%` }}
                    />
                </div>
            </div>

            {/* Day/Night indicator */}
            <div className="mt-4 flex items-center gap-2 text-sm">
                {isDaytime ? (
                    <>
                        <span className="text-yellow-400 text-lg">☀️</span>
                        <span className="text-gray-400">Day Time</span>
                        <span className="text-xs text-gray-600 ml-auto">6:00 AM - 6:00 PM</span>
                    </>
                ) : (
                    <>
                        <span className="text-blue-300 text-lg">🌙</span>
                        <span className="text-gray-400">Night Time</span>
                        <span className="text-xs text-gray-600 ml-auto">6:00 PM - 6:00 AM</span>
                    </>
                )}
            </div>
        </div>
    );
}
