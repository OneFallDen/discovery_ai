import {useState} from "react";

interface SafeModeSwitchProps {
    isSafe: boolean;
    onToggle: () => void;
}

function SafeModeSwitch({isSafe, onToggle}: SafeModeSwitchProps) {
    const [isActive, setIsActive] = useState(isSafe);

    const toggle = () => {
        setIsActive(!isActive);
        onToggle();
    };

    return (
        <div
            className={`switch-wrapper ${isActive ? "active" : "unsafe"}`}
            onClick={toggle}
        >
      <span className="switch-label">
        {isActive ? "Safe Mode" : "Unsafe Mode"}
      </span>
        </div>
    );
};

export default SafeModeSwitch;
