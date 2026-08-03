import { useEffect, useState } from "react";

type ReadingProgressSliderProps = {
  progressPercent: number;
  onProgressCommit: (progressPercent: number) => void;
};

const formatProgress = (progressPercent: number) =>
  `${Math.round(progressPercent)}%`;

export function ReadingProgressSlider({
  progressPercent,
  onProgressCommit,
}: ReadingProgressSliderProps) {
  const [draftProgressPercent, setDraftProgressPercent] =
    useState(progressPercent);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setDraftProgressPercent(progressPercent);
    }
  }, [isDragging, progressPercent]);

  const sliderProgressPercent = isDragging
    ? draftProgressPercent
    : progressPercent;

  const commitDraftProgress = () => {
    setIsDragging(false);
    onProgressCommit(draftProgressPercent);
  };

  return (
    <div className="reading-progress">
      <input
        aria-label="Положение чтения"
        className="reading-progress-slider"
        max="100"
        min="0"
        onBlur={commitDraftProgress}
        onChange={(event) => {
          const nextProgressPercent = Number(event.currentTarget.value);

          setDraftProgressPercent(nextProgressPercent);
        }}
        onKeyUp={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            commitDraftProgress();
          }
        }}
        onPointerDown={() => {
          setIsDragging(true);
        }}
        onPointerUp={commitDraftProgress}
        step="0.1"
        type="range"
        value={sliderProgressPercent}
      />
      <span className="reading-progress-value">
        {formatProgress(sliderProgressPercent)}
      </span>
    </div>
  );
}
