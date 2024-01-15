import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetImageFunc,
  GetDirectoryFunc,
  ExtensionClientAbstract,
  Series,
  PageRequesterData,
  SetSettingsFunc,
  GetSettingsFunc,
  GetSettingTypesFunc,
  GetFilterOptionsFunc,
  FilterValues,
  WebviewFunc,
} from '@tiyo/common';
import { NepClient } from '../../generic/nep/nep';
import { METADATA } from './metadata';

export * from './metadata';

export class ExtensionClient extends ExtensionClientAbstract {
  nepClient: NepClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
  }

  override getSeries: GetSeriesFunc = (id: string) => this.nepClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id: string) => this.nepClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => this.nepClient.getPageRequesterData(seriesSourceId, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    this.nepClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series: Series, url: string) =>
    this.nepClient.getImage(series, url);

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) =>
    this.nepClient.getDirectory(page, filterValues);

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) =>
    this.nepClient.getSearch(text, page, filterValues);

  override getSettingTypes: GetSettingTypesFunc = () => this.nepClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.nepClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) =>
    this.nepClient.setSettings(newSettings);

  override getFilterOptions: GetFilterOptionsFunc = () => this.nepClient.getFilterOptions();
}
