import {
  LanguageKey,
  Series,
  SeriesStatus,
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetImageFunc,
  PageRequesterData,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  SeriesListResponse,
  GetFilterOptionsFunc,
  FilterSort,
  SortDirection,
  FilterValues,
  FilterSortValue,
} from '@tiyo/common';
import { JSDOM } from 'jsdom';
import { METADATA } from './metadata';

export * from './metadata';

const BASE_URL = 'https://nana.my.id';

const parseDirectoryResponse = (doc: Document): SeriesListResponse => {
  const items = doc.querySelectorAll('#thumbs_container > .id1');
  const seriesList = Array.from(items).map((item) => {
    const link = item.querySelector('div.id3 > a');
    const title = link.getAttribute('title');
    const img = link.querySelector('img');
    const sourceId = link.getAttribute('href')!.split('/').pop();
    console.log(sourceId);

    const series: Series = {
      id: undefined,
      extensionId: METADATA.id,
      sourceId: sourceId,
      title,
      altTitles: [],
      description: '',
      authors: [],
      artists: [],
      tags: [],
      status: SeriesStatus.ONGOING,
      originalLanguageKey: LanguageKey.ENGLISH,
      numberUnread: 0,
      remoteCoverUrl: `${BASE_URL}/${img.getAttribute('src')}`,
    };
    return series;
  });

  const lastPaginator = Array.from(doc.querySelectorAll('.paginate_button')).pop();
  const hasMore = !Array.from(lastPaginator.classList).includes('current');

  return {
    seriesList,
    hasMore,
  };
};

export class ExtensionClient extends ExtensionClientAbstract {
  override getSeries: GetSeriesFunc = (id: string) => {
    return fetch(`${BASE_URL}/reader/${id}`)
      .then((response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        const thumbSrc = doc.getElementById('img').getAttribute('src');

        const title = text.split('Reader.filename = "/home/')[1].split('.zip"')[0];
        const tagsStr = text.split('Reader.tags = "')[1].split('"')[0];
        const tags = tagsStr.split(', ');
        const creators = tags.length > 0 ? [tags[0]] : [];

        const series: Series = {
          extensionId: METADATA.id,
          sourceId: id,
          title,
          altTitles: [],
          description: '',
          authors: creators,
          artists: creators,
          tags: tags || [],
          status: SeriesStatus.COMPLETED,
          originalLanguageKey: LanguageKey.MULTI,
          numberUnread: 0,
          remoteCoverUrl: `${BASE_URL}${thumbSrc}`,
        };
        return series;
      });
  };

  override getChapters: GetChaptersFunc = (id: string) => {
    return new Promise((resolve) =>
      resolve([
        {
          id: undefined,
          seriesId: undefined,
          sourceId: '',
          title: '',
          chapterNumber: '1',
          volumeNumber: '',
          languageKey: LanguageKey.ENGLISH,
          groupName: '',
          time: 0,
          read: false,
        },
      ])
    );
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => {
    return fetch(`${BASE_URL}/reader/${seriesSourceId}`)
      .then((response) => response.text())
      .then((data: string) => {
        const pages = JSON.parse(data.split('Reader.pages = ')[1].split('.pages')[0]).pages;
        return {
          server: '',
          hash: '',
          numPages: pages.length,
          pageFilenames: pages,
        };
      });
  };

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    return pageRequesterData.pageFilenames.map((page) => `${BASE_URL}${page}`);
  };

  override getImage: GetImageFunc = (series: Series, url: string) => {
    return new Promise((resolve, _reject) => {
      resolve(url);
    });
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return this.getSearch('', page, filterValues);
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    const params = new URLSearchParams({
      p: `${page}`,
      q: text,
    });
    if ('sort' in filterValues) {
      const sortValue = filterValues['sort'] as FilterSortValue;
      params.append('sort', sortValue.direction === SortDirection.DESCENDING ? 'desc' : 'asc');
    }

    return fetch(`${BASE_URL}/?${params}`)
      .then((response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        return parseDirectoryResponse(doc);
      });
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return {};
  };

  override getSettings: GetSettingsFunc = () => {
    return {};
  };

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) => {};

  override getFilterOptions: GetFilterOptionsFunc = () => {
    return [
      new FilterSort('sort', 'Sort', {
        key: 'date',
        direction: SortDirection.DESCENDING,
      })
        .withFields([{ key: 'date', label: 'Date Added' }])
        .withSupportsBothDirections(true),
    ];
  };
}
