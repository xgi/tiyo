import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetFilterOptionsFunc,
  GetSearchFunc,
  GetImageFunc,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  Series,
  PageRequesterData,
  SetSettingsFunc,
  GetSettingsFunc,
  GetSettingTypesFunc,
  FilterValues,
  WebviewFunc,
} from '@tiyo/common';
import { METADATA } from './metadata';
import { FoolSlideClient } from '../../generic/foolslide';

export * from './metadata';

export class ExtensionClient extends ExtensionClientAbstract {
  foolslideClient: FoolSlideClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.foolslideClient = new FoolSlideClient(
      METADATA.id,
      'https://reader.deathtollscans.net',
      METADATA.translatedLanguage
    );
  }

  override getSeries: GetSeriesFunc = (id: string) => this.foolslideClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id: string) => this.foolslideClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => this.foolslideClient.getPageRequesterData(seriesSourceId, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    this.foolslideClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series: Series, url: string) =>
    this.foolslideClient.getImage(series, url);

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) =>
    this.foolslideClient.getSearch(text, page, filterValues);

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) =>
    this.foolslideClient.getDirectory(page, filterValues);

  override getSettingTypes: GetSettingTypesFunc = () => this.foolslideClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.foolslideClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) =>
    this.foolslideClient.setSettings(newSettings);

  override getFilterOptions: GetFilterOptionsFunc = () => this.foolslideClient.getFilterOptions();
}
