interface SafeModeSwitchProps {
    isSafe: boolean;
    onToggle: () => void;
}

function SafeModeSwitch({ isSafe, onToggle }: SafeModeSwitchProps) {
    return (
        <div
            className={`switch-wrapper ${isSafe ? "active" : "unsafe"}`}
            onClick={onToggle}
        >
            <span className="switch-label">
                {isSafe ? "Safe Mode" : "Unsafe Mode"}
            </span>
        </div>
    );
}

export default SafeModeSwitch;
