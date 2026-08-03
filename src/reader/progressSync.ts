export type ReadingProgress = {
  chunkIndex: number;
  chunkProgress: number;
};

type ProgressReadableReader = {
  isPagePlacementPending: boolean;
  onChange: (listener: (reader: ProgressReadableReader) => void) => () => void;
  readingProgress: ReadingProgress;
};

type StoredReadingProgress = ReadingProgress & {
  updatedAt: number;
  version: 2;
};

type ReadingProgressChangeCallback = (progress: ReadingProgress) => void;

const STORAGE_KEY_PREFIX = "reader:progress";

const isReadingProgress = (value: unknown): value is StoredReadingProgress => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const progress = value as Partial<StoredReadingProgress>;

  return (
    progress.version === 2 &&
    typeof progress.chunkIndex === "number" &&
    Number.isInteger(progress.chunkIndex) &&
    typeof progress.chunkProgress === "number" &&
    progress.chunkProgress >= 0 &&
    progress.chunkProgress <= 100
  );
};

export class LocalReadingProgressSyncService {
  private lastProgress: ReadingProgress | null = null;
  private readonly onProgressChange?: ReadingProgressChangeCallback;
  private readonly storageKey: string;

  constructor(
    bookId: string,
    onProgressChange?: ReadingProgressChangeCallback,
  ) {
    this.onProgressChange = onProgressChange;
    this.storageKey = `${STORAGE_KEY_PREFIX}:${bookId}`;
  }

  attachReader(reader: ProgressReadableReader) {
    return reader.onChange((changedReader) => {
      this.syncReaderProgress(changedReader);
    });
  }

  readProgress(): ReadingProgress | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    const serializedProgress = storage.getItem(this.storageKey);

    if (!serializedProgress) {
      return null;
    }

    try {
      const parsedProgress: unknown = JSON.parse(serializedProgress);

      if (!isReadingProgress(parsedProgress)) {
        return null;
      }

      const progress = {
        chunkIndex: parsedProgress.chunkIndex,
        chunkProgress: parsedProgress.chunkProgress,
      };

      this.lastProgress = progress;
      return progress;
    } catch {
      return null;
    }
  }

  syncProgress(progress: ReadingProgress) {
    if (this.isSameProgress(progress)) {
      return;
    }

    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    const storedProgress: StoredReadingProgress = {
      chunkIndex: progress.chunkIndex,
      chunkProgress: this.serializeChunkProgress(progress.chunkProgress),
      updatedAt: Date.now(),
      version: 2,
    };

    try {
      storage.setItem(this.storageKey, JSON.stringify(storedProgress));
    } catch {
      return;
    }

    this.lastProgress = storedProgress;
    this.onProgressChange?.(storedProgress);
  }

  private syncReaderProgress(reader: ProgressReadableReader) {
    if (reader.isPagePlacementPending) {
      return;
    }

    this.syncProgress(reader.readingProgress);
  }

  private getStorage() {
    if (typeof globalThis.localStorage === "undefined") {
      return null;
    }

    return globalThis.localStorage;
  }

  private isSameProgress(progress: ReadingProgress) {
    return (
      this.lastProgress?.chunkIndex === progress.chunkIndex &&
      this.serializeChunkProgress(this.lastProgress.chunkProgress) ===
        this.serializeChunkProgress(progress.chunkProgress)
    );
  }

  private serializeChunkProgress(chunkProgress: number) {
    return Math.round(chunkProgress * 10_000) / 10_000;
  }
}
