function TypingBox({ text, value, onChange, disabled = false }) {
  return (
    <div className="typing-card">
      <div className="typing-text" aria-label="Typing challenge text">
        {text.split("").map((character, index) => {
          let className = "";

          if (index < value.length) {
            className = value[index] === character ? "correct" : "incorrect";
          }

          if (index === value.length) className = "current";

          return (
            <span className={className} key={index}>
              {character}
            </span>
          );
        })}
      </div>

      <textarea
        value={value}
        onChange={onChange}
        maxLength={text.length}
        autoFocus
        placeholder="Start typing here..."
        disabled={disabled}
        spellCheck={false}
        aria-label="Type the challenge text"
      />

      {!value.length && (
        <p className="typing-hint">Start typing to begin the timer ⚡</p>
      )}
    </div>
  );
}

export default TypingBox;
