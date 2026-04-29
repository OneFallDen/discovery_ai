interface RatioSelectorProps {
    selectedRatio: number;
    onSelect: (ratio: number, width: number, height: number) => void;
}

const ratios = [
    {value: 1, resolution: { width: 665, height: 665 }, label: "1:1"},
    {value: 4 / 3, resolution: { width: 768, height: 576 }, label: "4:3"},
    {value: 3 / 4, resolution: { width: 576, height: 768 }, label: "3:4"},
    {value: 16 / 9, resolution: { width: 886, height: 498 }, label: "16:9"},
    {value: 9 / 16, resolution: { width: 498, height: 886 }, label: "9:16"},
];

function RatioSelector({selectedRatio, onSelect}: RatioSelectorProps) {
    return (
      <div className="ratio-selector">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            className={`ratio-btn ${selectedRatio === ratio.value ? "selected" : ""}`}
            onClick={() => {
              onSelect(ratio.value, ratio.resolution.width, ratio.resolution.height);
            }}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    );
}

export default RatioSelector;
