import {
  type GetSeriesFunc,
  type GetChaptersFunc,
  type GetPageRequesterDataFunc,
  type GetPageUrlsFunc,
  type GetFilterOptionsFunc,
  type GetSearchFunc,
  type GetImageFunc,
  type PageRequesterData,
  type GetDirectoryFunc,
  type GetSettingsFunc,
  type SetSettingsFunc,
  type GetSettingTypesFunc,
  type SeriesListResponse,
  type Chapter,
  type Series,
  type FilterValues,
  SeriesStatus,
  LanguageKey,
  FilterSort,
  SortDirection,
  TriState,
  FilterInput,
  FilterSeparator,
  FilterSelect,
  FilterMultiToggle,
  FilterSortValue,
  MultiToggleValues,
} from '@tiyo/common';

import {
  type APIResults,
  type APIPaginator,
  type APICategory,
  type APIPage,
  type APIChapter,
  type APISeriesBase,
  type APISeries,
} from './types';

import {
  SORT_FIELDS,
  STATUS_OPTIONS,
  DEFAULT_CATEGORIES,
  FilterControlIds
} from './filters';

function _getStatus(status: APISeries['status']): SeriesStatus {
  switch (status) {
    case 'ongoing':
    case 'hiatus':
      return SeriesStatus.ONGOING;
    case 'completed':
      return SeriesStatus.COMPLETED;
    case 'canceled':
      return SeriesStatus.CANCELLED;
  }
}

export class MangAdventureClient {
  extensionId: string;
  baseUrl: string;
  categories: string[];

  constructor(extensionId: string, baseUrl: string, categories?: string[]) {
    this.extensionId = extensionId;
    this.baseUrl = baseUrl;
    this.categories = categories ?? DEFAULT_CATEGORIES;
  }

  get _platform(): string {
    switch (process.platform) {
      case 'win32':
      case 'cygwin':
        return 'Windows';
      case 'linux':
        return 'Linux';
      case 'darwin':
        return 'Macintosh';
      default:
        return process.platform;
    }
  }

  get _userAgent(): string {
    return `Mozilla/5.0 (${this._platform}) Chrome/${process.versions.chrome} Houdoku`;
  }

  getSeries: GetSeriesFunc = (id) =>
    this._fetchAPI<APISeries, Series>(`/series/${id}`, (data) => ({
      id: undefined,
      extensionId: this.extensionId,
      sourceId: data.slug,
      title: data.title,
      altTitles: data.aliases,
      description: data.description,
      authors: data.authors,
      artists: data.artists,
      tags: data.categories,
      remoteCoverUrl: data.cover,
      status: _getStatus(data.status),
      originalLanguageKey: LanguageKey.JAPANESE,
      numberUnread: 0
    }));

  getChapters: GetChaptersFunc = (id) =>
    this._fetchAPI<APIResults<APIChapter>, Chapter[]>(
      `/series/${id}/chapters?date_format=timestamp`,
      (data) => data.results.map(value => ({
        id: undefined,
        seriesId: undefined,
        sourceId: value.id.toString(),
        title: value.full_title,
        chapterNumber: value.number.toString(),
        volumeNumber: value.volume?.toString() ?? '',
        groupName: value.groups.join(', '),
        time: Number(value.published),
        languageKey: LanguageKey.ENGLISH,
        read: false
      }))
    );

  getPageRequesterData: GetPageRequesterDataFunc = (_, chapterSourceId) =>
    this._fetchAPI<APIResults<APIPage>, PageRequesterData>(
      `/chapters/${chapterSourceId}/pages?track=true`,
      (data) => ({
        server: '',
        hash: '',
        numPages: data.results.length,
        pageFilenames: data.results.map(p => p.image)
      })
    );

  getDirectory: GetDirectoryFunc = (page, filterValues) =>
    this.getSearch('', page, filterValues);

  getSearch: GetSearchFunc = (text, page, filterValues) => {
    const params = new URLSearchParams({page: page.toString()});
    if (text) params.set('title', text);
    if (FilterControlIds.Sort in filterValues) {
      const sort = filterValues[FilterControlIds.Sort] as FilterSortValue;
      const prefix = sort.direction == SortDirection.DESCENDING ? '-' : '';
      params.set('sort', prefix + sort.key);
    }
    if (FilterControlIds.Author in filterValues) {
      const author = filterValues[FilterControlIds.Author] as string;
      if (author) params.set('author', author);
    }
    if (FilterControlIds.Artist in filterValues) {
      const artist = filterValues[FilterControlIds.Artist] as string;
      if (artist) params.set('artist', artist);
    }
    if (FilterControlIds.Status in filterValues) {
      const status = filterValues[FilterControlIds.Status] as string;
      params.set('status', status);
    }
    if (FilterControlIds.Categories in filterValues) {
      const values = filterValues[FilterControlIds.Categories] as MultiToggleValues;
      const categories = Object.entries(values)
        .filter(([key, value]) => value != TriState.IGNORE)
        .map(([key, value]) => (value == TriState.EXCLUDE ? '-' : '') + key);
      if (categories.length > 0) params.set('categories', categories.join(','));
    }
    return this._fetchAPI<APIPaginator<APISeriesBase>, SeriesListResponse>(
      `/series?${params}`, (data) => ({
        hasMore: !data.last,
        seriesList: data.results.filter(value => value.chapters).map(value => ({
          id: undefined,
          extensionId: this.extensionId,
          sourceId: value.slug,
          title: value.title,
          altTitles: [],
          description: '',
          authors: [],
          artists: [],
          tags: [],
          remoteCoverUrl: value.cover,
          status: SeriesStatus.ONGOING,
          originalLanguageKey: LanguageKey.JAPANESE,
          numberUnread: 0
        }))
      })
    );
  }

  getPageUrls: GetPageUrlsFunc = (pageRequesterData) =>
    pageRequesterData.pageFilenames;

  getImage: GetImageFunc = (series, url) =>
    Promise.resolve(url);

  getFilterOptions: GetFilterOptionsFunc = () => [
    new FilterSort(FilterControlIds.Sort, 'Sort', {
      key: 'title', direction: SortDirection.ASCENDING
    }).withFields(SORT_FIELDS)
      .withSupportsBothDirections(true),
    new FilterSeparator('separator1', '', ''),
    new FilterInput(FilterControlIds.Author, 'Author', ''),
    new FilterInput(FilterControlIds.Artist, 'Artist', ''),
    new FilterSeparator('separator2', '', ''),
    new FilterSelect(FilterControlIds.Status, 'Status', 'any')
      .withOptions(STATUS_OPTIONS),
    new FilterSeparator('separator3', '', ''),
    new FilterMultiToggle(FilterControlIds.Categories, 'Categories', {})
      .withFields(this.categories.map(key => ({ key, label: key })))
      .withIsTriState(true),
  ];

  getSettingTypes: GetSettingTypesFunc = () => ({});

  getSettings: GetSettingsFunc = () => ({});

  setSettings: SetSettingsFunc = (newSettings) => {};

  _fetchAPI<T, R>(path: string, transform: (data: T) => R): Promise<R> {
    const url = new URL('/api/v2' + path, this.baseUrl);
    const headers = new Headers({ 'User-Agent': this._userAgent });
    return fetch(url, { headers }).then(res => res.json()).then(transform);
  }
}
