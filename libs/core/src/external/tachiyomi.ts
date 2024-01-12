import {
  Chapter,
  ExternalExtension,
  LanguageKey,
  Series,
  SeriesStatus,
} from "@tiyo/common";

export const TachiyomiSeriesStatusMap = {
  0: SeriesStatus.ONGOING,
  1: SeriesStatus.ONGOING,
  2: SeriesStatus.COMPLETED,
  3: SeriesStatus.ONGOING,
  4: SeriesStatus.COMPLETED,
  5: SeriesStatus.CANCELLED,
  6: SeriesStatus.ONGOING,
};

export const convertTachiyomiManga = (
  data: any,
  extensionId: string,
  externalExtension: ExternalExtension,
  sourceIdConverter: (original: string) => string,
  chapterIdConverter: (original: string) => string
): { series: Series; chapters: Chapter[] } => {
  const series: Series = {
    id: undefined,
    extensionId,
    sourceId: sourceIdConverter(data.url),
    title: data.title,
    altTitles: [],
    description: data.description || "",
    authors: "author" in data ? [data.author] : [],
    artists: "artist" in data ? [data.artist] : [],
    tags: "genre" in data ? [data.genre] : [],
    status: "status" in data ? TachiyomiSeriesStatusMap[data.status] : SeriesStatus.ONGOING,
    originalLanguageKey: LanguageKey.MULTI,
    numberUnread: 0,
    remoteCoverUrl: data.thumbnailUrl,
  };

  const chapters: Chapter[] = Object.values(data.chapters).map((chapterData: any) => {
    return {
      id: undefined,
      seriesId: undefined,
      sourceId: chapterIdConverter(chapterData.url),
      title: chapterData.name || "",
      chapterNumber: `${chapterData.chapterNumber}`,
      volumeNumber: "",
      languageKey: externalExtension.languageKey,
      groupName: chapterData.scanlator || "",
      time: chapterData.dateUpload || 0,
      read: false,
    };
  });

  return {
    series: series,
    chapters: chapters,
  };
};
