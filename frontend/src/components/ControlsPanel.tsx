import { useCallback } from "react";
import Header from "./Header";
import SafeModeSwitch from "./SafeModeSwitch";
import RatioSelector from "./RatioSelector";

interface ControlsPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  ratio: number;
  onRatioChange: (ratio: number, width: number, height: number) => void;
  isSafe: boolean;
  onSafeToggle: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

function ControlsPanel({
  prompt,
  onPromptChange,
  ratio,
  onRatioChange,
  isSafe,
  onSafeToggle,
  onGenerate,
  isGenerating = false,
}: ControlsPanelProps) {
  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    onGenerate();
  }, [prompt, onGenerate]);

  return (
    <div>
      <Header />
      <section className="controls-container">
        <div className="controls-wrapper">
          <div className="input-group">
            <textarea
              id="promptInput"
              placeholder="Describe the image to generate..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
            />
            <button
              className="primary-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <span>Generate</span>
            </button>
          </div>

          <div className="settings-row">
            <SafeModeSwitch isSafe={isSafe} onToggle={onSafeToggle} />
            <RatioSelector selectedRatio={ratio} onSelect={onRatioChange} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ControlsPanel;
