import {
  Chapter,
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
  GetFilterOptionsFunc,
  FilterValues,
} from '@tiyo/common';
import { METADATA } from './metadata';

export * from './metadata';

const API_URL = 'https://api.kouhai.work/v3';
const STORAGE_URL = 'https://api.kouhai.work/storage';

const STATUS_MAP: { [key: string]: SeriesStatus } = {
  ongoing: SeriesStatus.ONGOING,
  finished: SeriesStatus.COMPLETED,
  'axed/dropped': SeriesStatus.CANCELLED,
};

export class ExtensionClient extends ExtensionClientAbstract {
  _parseSeries = (data: any) => {
    const sourceTags = (data.genres || [])
      .concat(data.themes || [])
      .concat(data.demographics || [])
      .map((tag: [number, string] | { id: number; name: string }) =>
        'name' in tag ? tag.name : tag[1]
      );

    const authors = data.authors
      ? data.authors.map((author: { id: Number; name: string }) => author.name)
      : [];
    const artists = data.artists
      ? data.artists.map((artist: { id: Number; name: string }) => artist.name)
      : [];

    const series: Series = {
      id: undefined,
      extensionId: METADATA.id,
      sourceId: data.id,

      title: data.title,
      altTitles: data.alternative_titles || [],
      description: data.synopsis,
      authors: authors,
      artists: artists,
      tags: sourceTags,
      status: STATUS_MAP[data.status] || SeriesStatus.ONGOING,
      originalLanguageKey: LanguageKey.JAPANESE,
      numberUnread: 0,
      remoteCoverUrl: `${STORAGE_URL}/${data.cover}`,
    };
    return series;
  };

  override getSeries: GetSeriesFunc = (id: string) => {
    return fetch(`${API_URL}/manga/get/${id}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        return this._parseSeries(json.data);
      });
  };

  override getChapters: GetChaptersFunc = (id: string) => {
    return fetch(`${API_URL}/manga/get/${id}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        return json.data.chapters.map((chapterData: any) => {
          const groupName =
            chapterData.groups && chapterData.groups.length > 0 ? chapterData.groups[0].name : '';

          const chapter: Chapter = {
            sourceId: chapterData.id,
            title: chapterData.name || '',
            chapterNumber: chapterData.number,
            volumeNumber: '',
            languageKey: LanguageKey.ENGLISH,
            groupName: groupName,
            time: new Date(chapterData).getTime(),
            read: false,
          };
          return chapter;
        });
      });
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => {
    return fetch(`${API_URL}/chapters/get/${chapterSourceId}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const pageFilenames: string[] = json.chapter.pages.map(
          (pageData: { id: number; next_id: number; media: string }) => pageData.media
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
    return pageRequesterData.pageFilenames.map((filename: string) => `${STORAGE_URL}/${filename}`);
  };

  override getImage: GetImageFunc = (series: Series, url: string) => {
    return new Promise((resolve, _reject) => {
      resolve(url);
    });
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return fetch(`${API_URL}/manga/all`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        return json.data.map((data: any) => this._parseSeries(data));
      })
      .then((seriesList: Series[]) => {
        return {
          seriesList,
          hasMore: false,
        };
      });
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    return fetch(`${API_URL}/search/manga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ search: text }),
    })
      .then((response: Response) => response.json())
      .then((json: any) => {
        return json.data.map((data: any) => {
          const series: Series = {
            extensionId: METADATA.id,
            sourceId: data[0],

            title: data[1],
            altTitles: [],
            description: data[2],
            authors: [],
            artists: [],
            tags: [],
            status: SeriesStatus.ONGOING,
            originalLanguageKey: LanguageKey.JAPANESE,
            numberUnread: 0,
            remoteCoverUrl: `${STORAGE_URL}/${data[4]}`,
          };
          return series;
        });
      })
      .then((seriesList: Series[]) => {
        return {
          seriesList,
          hasMore: false,
        };
      });
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return {};
  };

  override getSettings: GetSettingsFunc = () => {
    return {};
  };

  override setSettings: SetSettingsFunc = () => {};

  override getFilterOptions: GetFilterOptionsFunc = () => [];
}
