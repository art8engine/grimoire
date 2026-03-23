interface SettingsModalProps {
  showToolbar: boolean;
  fontSize: number;
  onToggleToolbar: (v: boolean) => void;
  onChangeFontSize: (v: number) => void;
  onClose: () => void;
}

export default function SettingsModal({
  showToolbar,
  fontSize,
  onToggleToolbar,
  onChangeFontSize,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>설정</span>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="modal-body">
          <div className="settings-row">
            <span>서식 도구 표시</span>
            <div
              className={`toggle${showToolbar ? " on" : ""}`}
              onClick={() => onToggleToolbar(!showToolbar)}
            />
          </div>
          <div className="settings-row">
            <span>글자 크기</span>
            <div className="font-size-control">
              <button
                className="font-size-btn"
                onClick={() => onChangeFontSize(fontSize - 1)}
              >
                -
              </button>
              <span className="font-size-value">{fontSize}</span>
              <button
                className="font-size-btn"
                onClick={() => onChangeFontSize(fontSize + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
