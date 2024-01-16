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
import { MadaraClient } from '../../generic/madara';
import { METADATA } from './metadata';

export * from './metadata';

export class ExtensionClient extends ExtensionClientAbstract {
  madaraClient: MadaraClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.madaraClient = new MadaraClient(METADATA.id, METADATA.url);
  }

  override getSeries: GetSeriesFunc = (id: string) => this.madaraClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id: string) => this.madaraClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => this.madaraClient.getPageRequesterData(seriesSourceId, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    this.madaraClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series: Series, url: string) =>
    this.madaraClient.getImage(series, url);

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) =>
    this.madaraClient.getSearch(text, page, filterValues);

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) =>
    this.madaraClient.getDirectory(page, filterValues);

  override getSettingTypes: GetSettingTypesFunc = () => this.madaraClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.madaraClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) =>
    this.madaraClient.setSettings(newSettings);

  override getFilterOptions: GetFilterOptionsFunc = () => this.madaraClient.getFilterOptions();
}
