'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

type ActionToastProps = {
    message: string;
    type?: 'success' | 'error';
    durationMs?: number;
};

export default function ActionToast({
    message,
    type = 'success',
    durationMs = 3500,
}: ActionToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), durationMs);
        return () => clearTimeout(timer);
    }, [durationMs]);

    if (!visible) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed right-4 top-4 z-[60]">
            <div
                className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${isSuccess
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
            >
                {isSuccess ? (
                    <FaCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                    <FaTimesCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <p>{message}</p>
            </div>
        </div>
    );
}
