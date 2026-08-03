# Reader runtime

Этот документ фиксирует текущие зоны ответственности reader runtime, синхронизации прогресса и React-интеграции.

## Модель книги

Reader получает книгу как подготовленный набор чанков:

```ts
type Book = {
  title: string;
  chunks: Chunk[];
};

type Chunk = {
  index: number;
  extent: number;
  startExtent: number;
  content: Block[];
};
```

`extent` - условный размер чанка. `startExtent` - накопленное смещение чанка от начала книги. Reader не должен зависеть от способа расчета этих значений.

## Reader

Reader отвечает за runtime-состояние чтения и навигацию.

Он знает:

- текущий чанк;
- текущую визуальную страницу внутри чанка;
- количество колонок текущего чанка;
- количество навигационных страниц текущего чанка;
- количество видимых колонок за один шаг навигации;
- pending-переход после смены чанка или восстановления прогресса;
- общий прогресс чтения относительно всей книги.

Reader умеет:

- перейти на следующую или предыдущую страницу;
- перейти на следующий или предыдущий чанк;
- принять DOM-результат пагинации после рендера чанка;
- восстановить позицию из `ReadingProgress`;
- эмитить `onChange(callback)` после изменения состояния.

Reader не отвечает за:

- `localStorage`;
- серверную синхронизацию;
- React state;
- DOM-измерение;
- способ получения книги.

## Sync Service

Sync service отвечает только за сохранение и чтение прогресса.

Он умеет:

- читать сохраненный `ReadingProgress` при старте;
- принимать change DTO от интеграционного слоя;
- решать, можно ли сохранять событие;
- сохранять прогресс в конкретное хранилище;
- вызвать внешний callback после успешного изменения прогресса.

Он не знает:

- инстанс Reader;
- методы навигации;
- количество страниц;
- структуру UI;
- как именно рендерится книга.

Текущая реализация - `LocalReadingProgressSyncService`, хранилище - `localStorage`.

## Integration Layer

React-компонент `App` сейчас выступает интеграционным слоем.

Он делает связку:

1. Создает или импортирует reader.
2. Создает sync service.
3. При первом рендере читает сохраненный `ReadingProgress`.
4. Передает сохраненный прогресс в `reader.restoreProgress(...)`.
5. Измеряет DOM после рендера чанка.
6. Передает результат измерения в reader.
7. Подписывается на `reader.onChange(...)`.
8. Обновляет React state для UI.
9. Передает change DTO в sync service.

`App` не должен содержать правила сохранения прогресса. Он только прокидывает событие между reader и sync service.

## DTO

Основной синхронизируемый прогресс:

```ts
type ReadingProgress = {
  chunkIndex: number;
  chunkProgress: number;
};
```

`chunkProgress` хранится в диапазоне `0...100` и обозначает начало текущей видимой страницы внутри чанка. Значение `100` означает позицию после окончания чанка.

Событие изменения reader:

```ts
type ReadingProgressChange = {
  isPagePlacementPending: boolean;
  readingProgress: ReadingProgress;
};
```

`isPagePlacementPending` нужен, чтобы sync service не сохранял промежуточную позицию до завершения DOM-пагинации после смены чанка или восстановления прогресса.

## Пагинация

Контент чанка рендерится через CSS Columns. DOM-слой сообщает reader:

- `textWidth`;
- `columnGap`;
- `columnWidth`;
- `visibleColumns`.

Reader рассчитывает:

```ts
columnCount =
  ceil((textWidth + columnGap) / (columnWidth + columnGap))

pageCount =
  ceil(columnCount / visibleColumns)
```

`pageCount` - это количество навигационных шагов. В широком режиме один шаг может показывать несколько колонок.

## Прогресс Внутри Чанка

Прогресс внутри чанка обозначает начало текущей видимой страницы:

```ts
currentColumnIndex =
  min(currentPageIndex * visibleColumns, columnCount - 1)

chunkProgress =
  currentColumnIndex / columnCount * 100
```

Примеры для чанка из 8 колонок при `visibleColumns = 1`:

| Page index | Visible page | Chunk progress |
|---:|---:|---:|
| 0 | 1 | 0% |
| 1 | 2 | 12.5% |
| 2 | 3 | 25% |
| 7 | 8 | 87.5% |

Последняя видимая страница не равна `100%`, потому что `100%` означает позицию после чанка.

## Общий Прогресс Книги

Общий прогресс считается из размера чанка и позиции внутри него:

```ts
totalExtent =
  lastChunk.startExtent + lastChunk.extent

readExtent =
  currentChunk.startExtent + currentChunk.extent * (chunkProgress / 100)

progressPercent =
  clamp(readExtent / totalExtent * 100, 0, 100)
```

Общий процент не является источником истины для восстановления позиции. Для восстановления сохраняется `ReadingProgress`.

## Восстановление Позиции

При старте:

1. Sync service возвращает сохраненный `ReadingProgress`.
2. Reader находит чанк по `chunkIndex`.
3. Reader выставляет pending progress.
4. UI рендерит нужный чанк.
5. DOM-слой измеряет колонки.
6. Reader переводит `chunkProgress` в ближайший `currentPageIndex`.

Формула восстановления:

```ts
columnIndex =
  floor((chunkProgress / 100) * columnCount)

pageIndex =
  floor(columnIndex / visibleColumns)
```

Результат ограничивается диапазоном `0...pageCount - 1`.

## Переходы Между Чанками

Переход вперед с последней страницы чанка:

1. Reader открывает следующий чанк.
2. Reader ставит pending placement `start`.
3. После DOM-пересчета открывается первая страница нового чанка.

Переход назад с первой страницы чанка:

1. Reader открывает предыдущий чанк.
2. Reader ставит pending placement `end`.
3. После DOM-пересчета открывается последняя страница предыдущего чанка.

## Текущие Файлы

- `src/reader/model.ts` - Reader core.
- `src/reader/progressSync.ts` - local progress sync service.
- `src/reader/types.ts` - модель книги.
- `src/reader/mock.ts` - моковая книга.
- `src/widgets/book-reader/*` - UI виджета чтения.
- `src/App.tsx` - интеграционный слой React.
