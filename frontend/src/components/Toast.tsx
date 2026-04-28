import {useState, useEffect} from "react";

interface ToastProps {
    message: string;
    visible: boolean;
}

function Toast({message, visible}: ToastProps) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <div className={`toast ${visible ? "show" : ""}`}>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
