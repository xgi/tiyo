import {
  LanguageKey,
  Series,
  SeriesStatus,
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetFilterOptionsFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  PageRequesterData,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  GetImageFunc,
  SeriesListResponse,
  SettingType,
  FilterValues,
  Chapter,
  WebviewFunc,
} from '@tiyo/common';
import { KomgaBook, KomgaPage, KomgaSeries, KomgaSeriesListResponse } from './types';
import { findLanguageKey } from '../../util/parsing';
import { METADATA } from './metadata';

export * from './metadata';

export enum SETTING_NAMES {
  ADDRESS = 'Address (with port)',
  USERNAME = 'Username',
  PASSWORD = 'Password',
}

const SETTING_TYPES = {
  [SETTING_NAMES.ADDRESS]: SettingType.STRING,
  [SETTING_NAMES.USERNAME]: SettingType.STRING,
  [SETTING_NAMES.PASSWORD]: SettingType.STRING,
};

const DEFAULT_SETTINGS = {
  [SETTING_NAMES.ADDRESS]: '',
  [SETTING_NAMES.USERNAME]: '',
  [SETTING_NAMES.PASSWORD]: '',
};

const STATUS_MAP: { [key: string]: SeriesStatus } = {
  HIATUS: SeriesStatus.ONGOING,
  ONGOING: SeriesStatus.ONGOING,
  ENDED: SeriesStatus.COMPLETED,
  ABANDONED: SeriesStatus.CANCELLED,
};

export class ExtensionClient extends ExtensionClientAbstract {
  authToken?: string;

  _getHeaders = () => {
    if (this.authToken) {
      return { 'X-Auth-Token': this.authToken };
    }
    return {
      Authorization: `Basic ${Buffer.from(
        `${this.settings[SETTING_NAMES.USERNAME]}:${this.settings[SETTING_NAMES.PASSWORD]}`
      ).toString('base64')}`,
      'X-Auth-Token': '',
    };
  };

  _updateAuthToken = (response: Response) => {
    if (response.headers.has('X-Auth-Token')) this.authToken = response.headers.get('X-Auth-Token');
  };

  _parseSeriesListResponse = (seriesListResponse: KomgaSeriesListResponse): SeriesListResponse => {
    const seriesList: Series[] = seriesListResponse.content.map((seriesObj: KomgaSeries) => ({
      id: undefined,
      extensionId: METADATA.id,
      sourceId: seriesObj.id,
      title: seriesObj.metadata.title,
      altTitles: [],
      description: seriesObj.metadata.summary,
      authors: [],
      artists: [],
      tags: [...seriesObj.metadata.genres, ...seriesObj.metadata.tags],
      status: STATUS_MAP[seriesObj.metadata.status],
      originalLanguageKey: findLanguageKey(seriesObj.metadata.language) || LanguageKey.MULTI,
      numberUnread: 0,
      remoteCoverUrl: `${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series/${
        seriesObj.id
      }/thumbnail`,
    }));

    return {
      seriesList,
      hasMore: !seriesListResponse.last,
    };
  };

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.settings = DEFAULT_SETTINGS;
  }

  override getSeries: GetSeriesFunc = (id: string) => {
    return fetch(`${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series/${id}`, {
      headers: this._getHeaders(),
    })
      .then((response: Response) => {
        this._updateAuthToken(response);
        return response.json();
      })
      .then((json: KomgaSeries) => {
        return {
          id: undefined,
          extensionId: METADATA.id,
          sourceId: json.id,
          title: json.metadata.title,
          altTitles: [],
          description: json.metadata.summary,
          authors: Array.from(new Set(json.booksMetadata.authors.map((author) => author.name))),
          artists: [],
          tags: [...json.metadata.genres, ...json.metadata.tags],
          status: STATUS_MAP[json.metadata.status],
          originalLanguageKey: findLanguageKey(json.metadata.language) || LanguageKey.MULTI,
          numberUnread: 0,
          remoteCoverUrl: `${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series/${
            json.id
          }/thumbnail`,
        };
      });
  };

  override getChapters: GetChaptersFunc = async (id: string) => {
    const languageKey = await fetch(`${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series/${id}`, {
      headers: this._getHeaders(),
    })
      .then((response: Response) => {
        this._updateAuthToken(response);
        return response.json();
      })
      .then((json: KomgaSeries) => findLanguageKey(json.metadata.language) || LanguageKey.MULTI);

    const chapters: Chapter[] = [];
    let page = 0;
    let continuing = true;
    while (continuing) {
      const json = await fetch(
        `${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series/${id}/books?page=${page}`,
        {
          headers: this._getHeaders(),
        }
      ).then((response: Response) => response.json());

      chapters.push(
        ...json.content.map((book: KomgaBook) => ({
          id: undefined,
          seriesId: undefined,
          sourceId: book.id,
          title: book.metadata.title,
          chapterNumber: book.metadata.number,
          volumeNumber: '',
          languageKey: languageKey,
          groupName: '',
          time: new Date(book.fileLastModified).getTime(),
          read: false,
        }))
      );
      page++;
      continuing = json.last === false;
    }

    return chapters;
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => {
    return fetch(`${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/books/${chapterSourceId}/pages`, {
      headers: this._getHeaders(),
    })
      .then((response: Response) => {
        this._updateAuthToken(response);
        return response.json();
      })
      .then((json: KomgaPage[]) => {
        const pageFilenames = json.map(
          (page) =>
            `${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/books/${chapterSourceId}/pages/${
              page.number
            }`
        );

        return {
          server: '',
          hash: '',
          numPages: pageFilenames.length,
          pageFilenames,
        };
      });
  };

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    return pageRequesterData.pageFilenames;
  };

  override getImage: GetImageFunc = (series: Series, url: string) => {
    return fetch(url, { headers: this._getHeaders() }).then((response) => response.arrayBuffer());
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return this.getSearch('', page, filterValues);
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    return fetch(
      `${this.settings[SETTING_NAMES.ADDRESS]}/api/v1/series?search=${text}&page=${
        page - 1
      }&deleted=false`,
      {
        headers: this._getHeaders(),
      }
    )
      .then((response: Response) => {
        this._updateAuthToken(response);
        return response.json();
      })
      .then((json: KomgaSeriesListResponse) => this._parseSeriesListResponse(json));
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return SETTING_TYPES;
  };

  override getSettings: GetSettingsFunc = () => {
    return this.settings;
  };

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) => {
    Object.keys(newSettings).forEach((key: string) => {
      if (key in this.settings && typeof (this.settings[key] === newSettings[key])) {
        this.settings[key] = newSettings[key];
      }
    });
  };

  override getFilterOptions: GetFilterOptionsFunc = () => [];
}
