import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetFilterOptionsFunc,
  GetSearchFunc,
  GetImageFunc,
  PageRequesterData,
  GetDirectoryFunc,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  WebviewResponse,
  SeriesListResponse,
  LanguageKey,
  Series,
  SeriesStatus,
  WebviewFunc,
} from '@tiyo/common';
import { JSDOM } from 'jsdom';

const SERIES_STATUS_MAP: { [key: string]: SeriesStatus } = {
  Ongoing: SeriesStatus.ONGOING,
  Completed: SeriesStatus.COMPLETED,
};

export class MangaBoxClient {
  extensionId: string;
  baseUrl: string;
  webviewFn: WebviewFunc;

  public directoryPathFn = (page: number) =>
    `manga_list?type=topview&category=all&state=all&page=${page}`;
  public searchPath = 'search/story';

  constructor(extensionId: string, baseUrl: string, webviewFn: WebviewFunc) {
    this.extensionId = extensionId;
    this.baseUrl = baseUrl;
    this.webviewFn = webviewFn;
  }

  _parseSearch = (doc: Document): SeriesListResponse => {
    let seriesContainers = doc.querySelectorAll(
      'div.list-truyen-item-wrap, div.search-story-item, div.list-story-item, div.story_item, div.content-genres-item'
    );
    const seriesList: Series[] = [...seriesContainers].map((seriesContainer) => {
      const sourceId = seriesContainer.querySelector('a').getAttribute('href');
      const img = seriesContainer.querySelector('img');
      const title = img.getAttribute('alt');
      const remoteCoverUrl = img.getAttribute('src');

      return {
        extensionId: this.extensionId,
        sourceId,
        title,
        altTitles: [],
        description: '',
        authors: [],
        artists: [],
        tags: [],
        status: SeriesStatus.ONGOING,
        originalLanguageKey: LanguageKey.JAPANESE,
        numberUnread: 0,
        remoteCoverUrl,
      };
    });

    const currentPageNum =
      parseInt(doc.querySelector('a.page_select, a.page-blue:not([href])')?.textContent) || 0;
    const lastPageNum =
      parseInt(doc.querySelector('a.page_last, a.page-last')?.textContent.match(/\((.*)\)/)[1]) ||
      0;
    return { seriesList, hasMore: currentPageNum < lastPageNum };
  };

  getSeries: GetSeriesFunc = (id: string) =>
    fetch(id)
      .then((response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;

        const container = doc.querySelectorAll('div.manga-info-top, div.panel-story-info')[0];
        const remoteCoverUrl = container.querySelector('img').getAttribute('src');
        const title = container.querySelectorAll('h1, h2')[0].textContent.trim();
        const description = doc.querySelector(
          'div#noidungm, div#panel-story-info-description'
        ).textContent;

        let tags: string[] = [];
        let authors: string[] = [];
        let status = SeriesStatus.ONGOING;
        if (doc.querySelectorAll('table.variations-tableInfo').length > 0) {
          tags = Array.from(
            Array.from(container.querySelectorAll('td'))
              .find((element) => element.textContent.includes('Genres'))
              .parentElement.lastElementChild.querySelectorAll('a')
          ).map((element) => element.textContent);
          authors = Array.from(
            Array.from(container.querySelectorAll('td'))
              .find((element) => element.textContent.includes('Author'))
              .parentElement.lastElementChild.querySelectorAll('a')
          ).map((element) => element.textContent);
          status =
            SERIES_STATUS_MAP[
              Array.from(container.querySelectorAll('td')).find((element) =>
                element.textContent.includes('Status')
              ).parentElement.lastElementChild.textContent
            ];
        } else {
          tags = Array.from(
            Array.from(container.querySelectorAll('li'))
              .find((element) => element.innerHTML.includes('Genres'))
              .querySelectorAll('a')
          ).map((element) => element.textContent);
          authors = Array.from(
            Array.from(container.querySelectorAll('li'))
              .find((element) => element.innerHTML.includes('Author'))
              .querySelectorAll('a')
          ).map((element) => element.textContent);
          status =
            SERIES_STATUS_MAP[
              Array.from(container.querySelectorAll('li'))
                .find((element) => element.textContent.includes('Status'))
                .textContent.split(' : ')[1]
            ];
        }

        const series: Series = {
          id: undefined,
          extensionId: this.extensionId,
          sourceId: id,

          title: title || '',
          altTitles: [],
          description,
          authors,
          artists: [],
          tags,
          status,
          originalLanguageKey: LanguageKey.JAPANESE,
          numberUnread: 0,
          remoteCoverUrl,
        };
        return series;
      });

  getChapters: GetChaptersFunc = (id: string) =>
    fetch(id)
      .then((response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;

        const chapterElements = doc.querySelectorAll(
          'div.chapter-list div.row, ul.row-content-chapter li'
        );
        return [...chapterElements].map((element) => {
          const link = element.querySelector('a');
          const chapterNum = link.getAttribute('href').match(/(\/|-)chap(ter)?(-|_)([\d|\.]+)/)[4];
          const matchVolume = link.textContent.match(/Vol\.(\d*)/);
          const volumeNum = matchVolume ? matchVolume[1] : '';

          return {
            id: undefined,
            seriesId: undefined,
            sourceId: link.getAttribute('href'),
            title: link.textContent,
            chapterNumber: chapterNum,
            volumeNumber: volumeNum || '',
            languageKey: LanguageKey.ENGLISH,
            groupName: '',
            time: 0,
            read: false,
          };
        });
      });

  getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) =>
    fetch(chapterSourceId)
      .then((response) => response.text())
      .then((text: string) => {
        const doc = new JSDOM(text).window.document;
        const imgs = doc.querySelectorAll('div.container-chapter-reader img');

        const pageUrls = [...imgs].map((img) => img.getAttribute('src'));
        return {
          server: '',
          hash: '',
          numPages: pageUrls.length,
          pageFilenames: pageUrls,
        };
      });

  getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    pageRequesterData.pageFilenames;

  getImage: GetImageFunc = (series: Series, url: string) => {
    return fetch(url, {
      headers: { Referer: this.baseUrl },
    }).then((response) => response.arrayBuffer());
  };

  getSearch: GetSearchFunc = (text: string, page: number) => {
    const query = text.replace(
      /!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'| |"|&|#|\[|]|~|-|$|_/,
      '_'
    );
    return this.webviewFn(`${this.baseUrl}/${this.searchPath}/${query}?page=${page}`).then(
      (response: WebviewResponse) => this._parseSearch(new JSDOM(response.text).window.document)
    );
  };

  getDirectory: GetDirectoryFunc = (page: number) =>
    this.webviewFn(`${this.baseUrl}/${this.directoryPathFn(page)}`).then(
      (response: WebviewResponse) => this._parseSearch(new JSDOM(response.text).window.document)
    );

  getSettingTypes: GetSettingTypesFunc = () => ({});

  getSettings: GetSettingsFunc = () => ({});

  setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) => {};

  getFilterOptions: GetFilterOptionsFunc = () => [];
}
