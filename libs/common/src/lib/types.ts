import { SeriesStatus, LanguageKey } from "./enums";

export type ExtensionMetadata = {
  id: string;
  name: string;
  url: string;
  version: string;
  translatedLanguage: LanguageKey | undefined;
};

export type PageRequesterData = {
  server: string;
  hash: string;
  numPages: number;
  pageFilenames: string[];
};

export type WebviewResponse = {
  text: string;
  url: string;
  title: string;
};

export type SeriesListResponse = {
  seriesList: Series[];
  hasMore: boolean;
};

export type Series = {
  id?: string;
  extensionId: string;
  sourceId: string;
  title: string;
  altTitles: string[];
  description: string;
  authors: string[];
  artists: string[];
  tags: string[];
  status: SeriesStatus;
  originalLanguageKey: LanguageKey;
  numberUnread: number;
  remoteCoverUrl: string;
  trackerKeys?: { [trackerId: string]: string };
  categories?: string[];
  preview?: boolean;
};

export type Chapter = {
  id?: string;
  seriesId?: string;
  sourceId: string;
  title: string;
  chapterNumber: string;
  volumeNumber: string;
  languageKey: LanguageKey;
  groupName: string;
  time: number;
  read: boolean;
};

export type Language = {
  key: LanguageKey;
  name: string;
  flagCode: string;
  iso639_1: string;
};

export type FilterValues = { [id: string]: unknown };

export type ExternalExtension = {
  id: string;
  languageKey: LanguageKey;
};

export type ConvertExternalDataResponse = {
  series: Series | undefined;
  chapters: Chapter[];
  messages?: {
    text: string;
    type: "info" | "warning" | "error";
  }[];
};
