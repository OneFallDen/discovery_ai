interface RatioSelectorProps {
    selectedRatio: number;
    onSelect: (ratio: number) => void;
}

const ratios = [
    {value: 1, label: "1:1"},
    {value: 4 / 3, label: "4:3"},
    {value: 16 / 9, label: "16:9"},
    {value: 9 / 16, label: "9:16"},
];

function RatioSelector({selectedRatio, onSelect}: RatioSelectorProps) {
    return (
      <div className="ratio-selector">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            className={`ratio-btn ${selectedRatio === ratio.value ? "selected" : ""}`}
            onClick={() => {
              onSelect(ratio.value);
            }}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    );
}
;

export default RatioSelector;
