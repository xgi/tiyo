import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetFilterOptionsFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetImageFunc,
  ExtensionMetadata,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  Series,
  PageRequesterData,
  SetSettingsFunc,
  GetSettingsFunc,
  GetSettingTypesFunc,
  FilterValues,
  SeriesStatus,
  LanguageKey,
  SeriesListResponse,
  WebviewResponse,
} from '@tiyo/common';
import { JSDOM } from 'jsdom';
import { METADATA } from './metadata';

export * from './metadata';

const BASE_URL = 'https://onepiecechapters.com';

const parseDirectoryResponse = (doc: Document): SeriesListResponse => {
  const items = doc.getElementsByClassName('bg-card border border-border rounded p-3 mb-3')!;

  const seriesList = Array.from(items).map((row: Element) => {
    const titleLink = row.getElementsByClassName('mb-3 text-white text-lg font-bold')![0];

    const header = titleLink.textContent.trim();
    const sourceId = titleLink.getAttribute('href').split('/mangas/')[1];
    const img = row
      .getElementsByClassName(' w-24 h-24 object-cover rounded-lg')![0]
      .getAttribute('src');

    const series: Series = {
      id: undefined,
      extensionId: METADATA.id,
      sourceId,
      title: header,
      altTitles: [],
      description: '',
      authors: [],
      artists: [],
      tags: [],
      status: SeriesStatus.ONGOING,
      originalLanguageKey: LanguageKey.JAPANESE,
      numberUnread: 0,
      remoteCoverUrl: img,
    };
    return series;
  });
  return {
    seriesList,
    hasMore: false,
  };
};

export class ExtensionClient extends ExtensionClientAbstract {
  override getSeries: GetSeriesFunc = (id: string) => {
    return this.webviewFn(`${BASE_URL}/mangas/${id}`).then((response: WebviewResponse) => {
      const doc = new JSDOM(response.text).window.document;

      const infoContainer = doc.getElementsByClassName(
        'order-1 md:order-2 bg-card border border-border rounded py-3'
      )![0];

      const title = infoContainer
        .getElementsByClassName('my-3 font-bold text-3xl')![0]
        .textContent.trim();

      const description = doc.getElementsByClassName('leading-6 my-3')![0].textContent.trim();
      const img = infoContainer.getElementsByTagName('img')![0];
      const series: Series = {
        extensionId: METADATA.id,
        sourceId: id,
        title: title,
        altTitles: [],
        description: description,
        authors: [],
        artists: [],
        tags: [],
        status: null,
        originalLanguageKey: null,
        numberUnread: 0,
        remoteCoverUrl: img.getAttribute('src')!,
      };
      return series;
    });
  };

  override getChapters: GetChaptersFunc = (id: string) => {
    return this.webviewFn(`${BASE_URL}/mangas/${id}`).then((response: WebviewResponse) => {
      const doc = new JSDOM(response.text).window.document;

      return Array.from(
        doc.getElementsByClassName('block border border-border bg-card mb-3 p-3 rounded')!
      ).map((row) => {
        const title = row.getElementsByClassName('text-gray-500')![0].textContent.trim();
        const chapterNumFull = row
          .getElementsByClassName('text-lg font-bold')![0]
          .textContent.trim()
          .split(' ');
        const chapterNum = chapterNumFull![chapterNumFull.length - 1];

        const sourceId = row.getAttribute('href').replace('/chapters/', '');

        return {
          id: undefined,
          seriesId: undefined,
          sourceId: sourceId,
          title: title,
          chapterNumber: chapterNum,
          volumeNumber: '',
          languageKey: LanguageKey.ENGLISH,
          groupName: '',
          time: 0,
          read: false,
        };
      });
    });
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => {
    return this.webviewFn(`${BASE_URL}/chapters/${chapterSourceId}`).then(
      (response: WebviewResponse) => {
        const doc = new JSDOM(response.text).window.document;
        const images = doc
          .getElementsByClassName('flex flex-col items-center justify-center')![0]
          .getElementsByTagName('img')!;
        const pageFilenames = Array.from(images).map((image) => image.getAttribute('src')!);

        return {
          server: '',
          hash: '',
          numPages: pageFilenames.length,
          pageFilenames,
        };
      }
    );
  };

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    return pageRequesterData.pageFilenames;
  };

  override getImage: GetImageFunc = (series: Series, url: string) => {
    return new Promise((resolve, reject) => {
      resolve(url);
    });
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return this.webviewFn(`${BASE_URL}/projects`).then((response: WebviewResponse) => {
      const doc = new JSDOM(response.text).window.document;
      return parseDirectoryResponse(doc);
    });
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    return this.webviewFn(`${BASE_URL}/projects`).then((response: WebviewResponse) => {
      const doc = new JSDOM(response.text).window.document;

      const parsed = parseDirectoryResponse(doc);
      return {
        hasMore: parsed.hasMore,
        seriesList: parsed.seriesList.filter((series) =>
          series.title.toLowerCase().includes(text.toLowerCase())
        ),
      };
    });
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return {};
  };

  override getSettings: GetSettingsFunc = () => {
    return {};
  };

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) => {};

  override getFilterOptions: GetFilterOptionsFunc = () => [];
}
