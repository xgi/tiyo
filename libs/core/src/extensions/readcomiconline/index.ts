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
  GetImageFunc,
  PageRequesterData,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  SeriesListResponse,
  SettingType,
  WebviewResponse,
  FilterValues,
  WebviewFunc,
} from '@tiyo/common';
import { JSDOM } from 'jsdom';
import { METADATA } from './metadata';

export * from './metadata';

const BASE_URL = 'https://readcomiconline.li';

const SERIES_STATUS_MAP: { [key: string]: SeriesStatus } = {
  Ongoing: SeriesStatus.ONGOING,
  Completed: SeriesStatus.COMPLETED,
};

enum SETTING_NAMES {
  USE_HIGH_QUALITY = 'Use high quality images',
}

const SETTING_TYPES = {
  [SETTING_NAMES.USE_HIGH_QUALITY]: SettingType.BOOLEAN,
};

const DEFAULT_SETTINGS = {
  [SETTING_NAMES.USE_HIGH_QUALITY]: true,
};

const getDetailsRowFields = (rows: Element[], text: string): string[] => {
  const row = rows.find((row) => row.textContent.includes(text));
  if (!row) return [];

  return Array.from(row.getElementsByTagName('a')!).map((element) => element.textContent.trim());
};

const parseDirectoryResponse = (doc: Document): SeriesListResponse => {
  const rows = doc.getElementsByClassName('section group list')!;
  const hasMore = doc.getElementsByClassName('right_bt next_bt')!.length > 0;

  const seriesList = Array.from(rows).map((row) => {
    const link = row.getElementsByTagName('a')![0];
    const img = link.getElementsByTagName('img')![0];

    const series: Series = {
      id: undefined,
      extensionId: METADATA.id,
      sourceId: link.getAttribute('href')!.replace('/Comic/', ''),

      title: img.getAttribute('title')!.trim(),
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

  return {
    seriesList,
    hasMore,
  };
};

export class ExtensionClient extends ExtensionClientAbstract {
  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.settings = DEFAULT_SETTINGS;
  }

  override getSeries: GetSeriesFunc = (id: string) => {
    return fetch(`${BASE_URL}/Comic/${id}`)
      .then((response: Response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        const parent = doc.getElementsByClassName('section group')![0];
        const description = doc.getElementsByClassName('section group')![1].textContent.trim();

        const img = parent.getElementsByTagName('img')![0];
        const rows = Array.from(parent.getElementsByTagName('p')!);

        const altNames = getDetailsRowFields(rows, 'Other name:');
        const sourceTags = getDetailsRowFields(rows, 'Genres:');
        const authors = getDetailsRowFields(rows, 'Writer:');
        const artists = getDetailsRowFields(rows, 'Artist:');

        const statusRow = rows.find((row) => row.textContent.includes('Status:'));
        const statusStr =
          statusRow && false ? statusRow!.textContent.replace('Status:&nbsp;', '').trim() : '';

        const series: Series = {
          extensionId: METADATA.id,
          sourceId: id,

          title: img.getAttribute('title')!.trim(),
          altTitles: altNames,
          description: description,
          authors: authors,
          artists: artists,
          tags: sourceTags,
          status: SERIES_STATUS_MAP[statusStr] || SeriesStatus.ONGOING,
          originalLanguageKey: LanguageKey.ENGLISH,
          numberUnread: 0,
          remoteCoverUrl: `${BASE_URL}/${img.getAttribute('src')}`,
        };
        return series;
      });
  };

  override getChapters: GetChaptersFunc = (id: string) => {
    return fetch(`${BASE_URL}/Comic/${id}`)
      .then((response: Response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        const parent = doc.getElementsByClassName('section group')![2];
        const rows = parent.getElementsByTagName('li')!;

        return Array.from(rows).map((row) => {
          const link = row.getElementsByTagName('a')![0];
          const title = link.textContent.trim();
          let chapterNum = '';
          if (title.startsWith('Issue #')) {
            chapterNum = title.split('Issue #')[1];
          } else {
            const tpbRegex = /TPB (\d+)/i;
            const match: RegExpMatchArray | null = title.match(tpbRegex);
            if (match !== null) {
              const tpb = match[1];
              chapterNum = `0.${tpb}`;
            }
          }

          return {
            id: undefined,
            seriesId: undefined,
            sourceId: link.getAttribute('href')!,
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
    const qualityStr = this.settings[SETTING_NAMES.USE_HIGH_QUALITY] ? 'hq' : 'lq';

    return this.webviewFn(`${BASE_URL}${chapterSourceId}&quality=${qualityStr}&readType=1`).then(
      (response: WebviewResponse) => {
        const doc = new JSDOM(response.text).window.document;
        const images = doc.querySelectorAll('#divImage img');
        const pageFilenames = Array.from(images).map((img) => img.getAttribute('src'));

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
    return fetch(`${BASE_URL}/ComicList/LatestUpdate?page=${page}`)
      .then((response: Response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        return parseDirectoryResponse(doc);
      });
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    return fetch(`${BASE_URL}/AdvanceSearch?page=${page}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: [`comicName=${text}`, 'genres=[]', 'status='].join('&'),
    })
      .then((response: Response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        return parseDirectoryResponse(doc);
      });
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
