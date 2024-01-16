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
import { PizzaReaderClient } from '../../generic/pizzareader';

export * from './metadata';

export class ExtensionClient extends ExtensionClientAbstract {
  pizzaReaderClient: PizzaReaderClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.pizzaReaderClient = new PizzaReaderClient(METADATA.id, METADATA.url);
  }

  override getSeries: GetSeriesFunc = (id: string) => this.pizzaReaderClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id: string) => this.pizzaReaderClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string
  ) => this.pizzaReaderClient.getPageRequesterData(seriesSourceId, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    this.pizzaReaderClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series: Series, url: string) =>
    this.pizzaReaderClient.getImage(series, url);

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) =>
    this.pizzaReaderClient.getSearch(text, page, filterValues);

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) =>
    this.pizzaReaderClient.getDirectory(page, filterValues);

  override getSettingTypes: GetSettingTypesFunc = () => this.pizzaReaderClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.pizzaReaderClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) =>
    this.pizzaReaderClient.setSettings(newSettings);

  override getFilterOptions: GetFilterOptionsFunc = () => this.pizzaReaderClient.getFilterOptions();
}
