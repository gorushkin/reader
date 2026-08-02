import type { ReaderState } from "../model/types";

type ChunkControlsProps = {
  onNextChunk: () => void;
  onPreviousChunk: () => void;
  readerState: ReaderState;
};

export function ChunkControls({
  onNextChunk,
  onPreviousChunk,
  readerState,
}: ChunkControlsProps) {
  return (
    <div className="reader-controls">
      <button
        type="button"
        disabled={readerState.currentChunk === 1}
        onClick={onPreviousChunk}
      >
        Назад
      </button>
      <span>
        {readerState.currentChunk} / {readerState.chunks}
      </span>
      <button
        type="button"
        disabled={readerState.currentChunk === readerState.chunks}
        onClick={onNextChunk}
      >
        Вперед
      </button>
    </div>
  );
}
