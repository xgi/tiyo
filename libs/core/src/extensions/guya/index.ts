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

export class ExtensionClient extends ExtensionClientAbstract {
  override getSeries: GetSeriesFunc = (id: string) => {
    return fetch(`https://guya.moe/api/series/${id}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const series: Series = {
          id: undefined,
          extensionId: METADATA.id,
          sourceId: json.slug,

          title: json.title,
          altTitles: [],
          description: json.description,
          authors: [json.author],
          artists: [json.artist],
          tags: [],
          status: SeriesStatus.ONGOING,
          originalLanguageKey: LanguageKey.JAPANESE,
          numberUnread: 0,
          remoteCoverUrl: `https://guya.moe/${json.cover}`,
        };
        return series;
      });
  };

  override getChapters: GetChaptersFunc = (id: string) => {
    return fetch(`https://guya.moe/api/series/${id}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const chapters: Chapter[] = [];
        const { groups } = json;

        Object.keys(json.chapters).forEach((chapterNum: string) => {
          const chapterData = json.chapters[chapterNum];
          Object.keys(json.chapters[chapterNum].groups).forEach((groupNum: string) => {
            chapters.push({
              id: undefined,
              seriesId: undefined,
              sourceId: `${chapterNum}:${json.slug}/chapters/${chapterData.folder}/${groupNum}`,
              title: chapterData.title,
              chapterNumber: chapterNum,
              volumeNumber: chapterData.volume,
              languageKey: LanguageKey.ENGLISH,
              groupName: groups[groupNum],
              time: chapterData.release_date[groupNum],
              read: false,
            });
          });
        });

        return chapters;
      });
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => {
    return fetch(`https://guya.moe/api/series/${seriesSourceId}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const chapterNum = chapterSourceId.split(':')[0];
        let groupNum = chapterSourceId.split('/').pop();
        groupNum = groupNum ? groupNum : '';

        const pageBasenames: string[] = json.chapters[chapterNum].groups[groupNum];
        const pageFilenames = pageBasenames.map((basename: string) => {
          return `https://guya.moe/media/manga/${chapterSourceId.split(':').pop()}/${basename}`;
        });

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
    return new Promise((resolve, reject) => {
      resolve(url);
    });
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return fetch(`https://guya.moe/api/get_all_series`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const seriesList: Series[] = [];

        Object.keys(json).forEach((title: string) => {
          const seriesData = json[title];
          const series: Series = {
            id: undefined,
            extensionId: METADATA.id,
            sourceId: seriesData.slug,

            title: title,
            altTitles: [],
            description: seriesData.description,
            authors: [seriesData.author],
            artists: [seriesData.artist],
            tags: [],
            status: SeriesStatus.ONGOING,
            originalLanguageKey: LanguageKey.JAPANESE,
            numberUnread: 0,
            remoteCoverUrl: `https://guya.moe/${seriesData.cover}`,
          };
          seriesList.push(series);
        });

        return seriesList;
      })
      .then((seriesList: Series[]) => {
        return {
          seriesList,
          hasMore: false,
        };
      });
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    return this.getDirectory(page, filterValues);
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
