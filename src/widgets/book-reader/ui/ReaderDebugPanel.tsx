import { useEffect, useState } from "react";
import type { ReaderDebugInfo } from "../model/types";

type ReaderDebugPanelProps = {
  readerDebugInfo: ReaderDebugInfo;
};

const formatDebugValue = (value: number | string | boolean | null) => {
  if (typeof value !== "number") {
    return value === null ? "null" : String(value);
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(4);
};

export function ReaderDebugPanel({ readerDebugInfo }: ReaderDebugPanelProps) {
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [debugCopyStatus, setDebugCopyStatus] = useState<
    "copied" | "failed" | null
  >(null);

  useEffect(() => {
    if (!debugCopyStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebugCopyStatus(null);
    }, 1_800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debugCopyStatus]);

  const copyDebugInfo = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(readerDebugInfo, null, 2),
      );
      setDebugCopyStatus("copied");
    } catch {
      setDebugCopyStatus("failed");
    }
  };

  return (
    <div className="debug-panel">
      <button
        className="debug-toggle"
        type="button"
        aria-expanded={isDebugOpen}
        onClick={() => setIsDebugOpen((isOpen) => !isOpen)}
      >
        Debug
      </button>
      {isDebugOpen && (
        <section className="debug-overlay" aria-label="Reader debug info">
          <div className="debug-overlay-header">
            <h2>Reader debug</h2>
            <div className="debug-overlay-actions">
              {debugCopyStatus && (
                <span role="status">
                  {debugCopyStatus === "copied" ? "Copied" : "Copy failed"}
                </span>
              )}
              <button type="button" onClick={copyDebugInfo}>
                Copy
              </button>
            </div>
          </div>
          <dl>
            <div>
              <dt>ReadingProgress.chunkIndex</dt>
              <dd>
                {formatDebugValue(readerDebugInfo.readingProgress.chunkIndex)}
              </dd>
            </div>
            <div>
              <dt>ReadingProgress.chunkProgress</dt>
              <dd>
                {formatDebugValue(
                  readerDebugInfo.readingProgress.chunkProgress,
                )}
              </dd>
            </div>
            <div>
              <dt>Total progress</dt>
              <dd>{formatDebugValue(readerDebugInfo.progressPercent)}%</dd>
            </div>
            <div>
              <dt>Chunk</dt>
              <dd>
                {readerDebugInfo.currentChunkNumber} /{" "}
                {readerDebugInfo.totalChunks}
              </dd>
            </div>
            <div>
              <dt>Chunk index</dt>
              <dd>{formatDebugValue(readerDebugInfo.currentChunkIndex)}</dd>
            </div>
            <div>
              <dt>Chunk extent</dt>
              <dd>{formatDebugValue(readerDebugInfo.currentChunkExtent)}</dd>
            </div>
            <div>
              <dt>Chunk startExtent</dt>
              <dd>
                {formatDebugValue(readerDebugInfo.currentChunkStartExtent)}
              </dd>
            </div>
            <div>
              <dt>Total extent</dt>
              <dd>{formatDebugValue(readerDebugInfo.totalExtent)}</dd>
            </div>
            <div>
              <dt>Page</dt>
              <dd>
                {readerDebugInfo.currentPageNumber} / {readerDebugInfo.pageCount}
              </dd>
            </div>
            <div>
              <dt>Page index</dt>
              <dd>{formatDebugValue(readerDebugInfo.currentPageIndex)}</dd>
            </div>
            <div>
              <dt>Columns</dt>
              <dd>{formatDebugValue(readerDebugInfo.columnCount)}</dd>
            </div>
            <div>
              <dt>Visible columns</dt>
              <dd>{formatDebugValue(readerDebugInfo.visibleColumns)}</dd>
            </div>
            <div>
              <dt>Pending placement</dt>
              <dd>{formatDebugValue(readerDebugInfo.pendingPagePlacement)}</dd>
            </div>
            <div>
              <dt>Pending chunkProgress</dt>
              <dd>{formatDebugValue(readerDebugInfo.pendingChunkProgress)}</dd>
            </div>
            <div>
              <dt>Placement pending</dt>
              <dd>{formatDebugValue(readerDebugInfo.isPagePlacementPending)}</dd>
            </div>
          </dl>
          <table>
            <caption>Chunks</caption>
            <thead>
              <tr>
                <th scope="col">index</th>
                <th scope="col">start</th>
                <th scope="col">extent</th>
              </tr>
            </thead>
            <tbody>
              {readerDebugInfo.chunks.map((chunk) => (
                <tr key={chunk.index}>
                  <td>{formatDebugValue(chunk.index)}</td>
                  <td>{formatDebugValue(chunk.startExtent)}</td>
                  <td>{formatDebugValue(chunk.extent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
