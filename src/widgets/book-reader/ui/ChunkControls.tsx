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
    <div className="reader-controls reader-controls-chunk">
      <div className="reader-controls-actions">
        <button
          type="button"
          disabled={readerState.currentChunk === 1}
          onClick={onPreviousChunk}
        >
          Назад
        </button>
        <button
          type="button"
          disabled={readerState.currentChunk === readerState.chunks}
          onClick={onNextChunk}
        >
          Вперед
        </button>
      </div>
      <div className="reader-controls-info">
        <span>Страница {readerState.currentPage} / {readerState.pages}</span>
        <span>Чанк {readerState.currentChunk} / {readerState.chunks}</span>
      </div>
    </div>
  );
}
