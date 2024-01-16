import { BrowserWindow } from 'electron';
import {
  Chapter,
  ExtensionMetadata,
  FilterValues,
  PageRequesterData,
  Series,
  SeriesListResponse,
  ExternalExtension,
  ConvertExternalDataResponse,
  WebviewResponse,
} from './types';
import { ExternalClient, SettingType } from './enums';
import { FilterOption } from './filters';

/**
 * Get the version of the plugin package.
 *
 * @returns string of npm-style version
 */
export interface GetVersionFunc {
  (): string;
}

/**
 * Get a list of available extensions.
 *
 * @returns list of metadata and instantiated client for all extensions
 */
export interface GetExtensionsFunc {
  (): { [key: string]: { metadata: ExtensionMetadata; client: ExtensionClientInterface } };
}

/**
 * Get a series from the content source.
 *
 * @param id the id of the series on the content source
 * @returns the series populated with fields from the content source, or undefined
 */
export interface GetSeriesFunc {
  (seriesId: string): Promise<Series | undefined>;
}

/**
 * Request chapters for a series from the content source.
 *
 * @param id the id of the series on the content source
 * @returns a list of chapters for the series, populated with fields from the content source
 */
export interface GetChaptersFunc {
  (id: string): Promise<Chapter[]>;
}

/**
 * Request data for a PageRequesterData object containing values used to get individual page URLs.
 *
 * This function is to support handling content sources with a non-uniform method of getting page
 * URLs -- i.e. each chapter may be hosted on an arbitrary server, which can only be identified
 * after requesting the base URL. The PageRequesterData received is solely used for GetPageUrlsFunc.
 *
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns the PageRequesterData for passing to any GetPageUrlsFunc call for the chapter
 */
export interface GetPageRequesterDataFunc {
  (seriesSourceId: string, chapterSourceId: string): Promise<PageRequesterData>;
}

/**
 * Get page URLs for a chapter.
 *
 * Strictly speaking, this function does not necessarily return precise URLs for a resource; it only
 * needs to return identifiers that can locate the actual page source (using the Series object if
 * necessary). Particularly, if the series is an archive file, this function returns a list of paths
 * within the archive that need to be extracted separately.
 *
 * @param pageRequesterData
 * @returns list of URLs that can be used to retrieve page data (using GetImageFunc)
 */
export interface GetPageUrlsFunc {
  (pageRequesterData: PageRequesterData): string[];
}

/**
 * Get resolved data for an image.
 *
 * The return value should either be a string to put inside the src tag of an HTML <img> (usually
 * the URL itself), or an ArrayBuffer that can be made into a Blob.
 *
 * @param series the series the image belongs to
 * @param url the url for this page, e.g. from GetPageUrlsFunc or Series.remoteCoverUrl
 * @returns promise for the data as described above
 */
export interface GetImageFunc {
  (series: Series, url: string): Promise<string | ArrayBuffer>;
}

/**
 * Search the content source for a series.
 *
 * @param text the user's search content, with any entered search params removed
 * @param params a map of user-specified parameters for searching. These are currently entered in
 * the form "key:value" like "author:oda" but this is not currently well-defined.
 * @param page the page number on the source
 * @returns SeriesListResponse with series that have fields set as available
 */
export interface GetSearchFunc {
  (text: string, page: number, filterValues: FilterValues): Promise<SeriesListResponse>;
}

/**
 * Get the directory for the content source (often equivalent to an empty search).
 *
 * @param page the page number on the source
 * @returns SeriesListResponse with series that have fields set as available
 */
export interface GetDirectoryFunc {
  (page: number, filterValues: FilterValues): Promise<SeriesListResponse>;
}

/**
 * Get the types for the extension's settings.
 *
 * @returns a map of settings for the extension and their SettingType
 */
export interface GetSettingTypesFunc {
  (): { [key: string]: SettingType };
}

/**
 * Get the current settings for the extension.
 *
 * @returns a map of settings for the extension (with default/initial values already set)
 */
export interface GetSettingsFunc {
  (): { [key: string]: any };
}

/**
 * Set the settings for the extension.
 *
 * Use GetSettingsFunc to see available fields and their types.
 *
 * @param settings a map of settings for the extension
 */
export interface SetSettingsFunc {
  (settings: { [key: string]: any }): void;
}

/**
 * Get supported extensions from external clients.
 *
 * Typically, there will only be one extension per client. However, there may be multiple
 * external extensions that correspond to one Houdoku extension. For example, Tachiyomi
 * has a unique ID for each MangaDex language, but Houdoku only has one MangaDex extension.
 *
 * External extension metadata is only relevant to the external client it is from. For example,
 * an external extension ID should only be used to differentiate it from other extensions
 * from the same client.
 *
 * @returns map of external clients and external extensions which correspond to this extension
 */
export interface GetExternalExtensionsFunc {
  (): { [key in ExternalClient]: ExternalExtension[] };
}

/**
 *
 * The shape of externalData depends on the externalExtension. These are not yet
 * strictly defined.
 *
 * @param externalClient external client the data is coming from
 * @param externalExtension external extension the data is coming from
 * @param externalData data for one series (optionally including chapter data) from the extension
 * @returns ConvertExternalDataResponse with parsed Series and Chapter list (if they were able
 * to be parsed) and optional messages array.
 */
export interface ConvertExternalDataFunc {
  (
    externalClient: ExternalClient,
    externalExtension: ExternalExtension,
    externalData: { [key: string]: any }
  ): ConvertExternalDataResponse;
}

/**
 * Get the extension's filter options.
 *
 * @returns List[FilterOption]
 */
export interface GetFilterOptionsFunc {
  (): FilterOption[];
}

export interface WebviewFunc {
  (
    url: string,
    options?: {
      httpReferrer?: string;
      userAgent?: string;
      extraHeaders?: string;
      postData?: (
        | { type: 'rawData'; bytes: Buffer }
        | {
            type: 'file';
            filePath: string;
            offset: number;
            length: number;
            modificationTime: number;
          }
      )[];
      baseURLForDataURL?: string;
    }
  ): Promise<WebviewResponse>;
}

export interface ExtensionClientInterface {
  webviewFn: WebviewFunc;
  settings: { [key: string]: any };

  getSeries: GetSeriesFunc;
  getChapters: GetChaptersFunc;
  getPageRequesterData: GetPageRequesterDataFunc;
  getPageUrls: GetPageUrlsFunc;
  getImage: GetImageFunc;
  getSearch: GetSearchFunc;
  getDirectory: GetDirectoryFunc;
  getSettingTypes: GetSettingTypesFunc;
  getSettings: GetSettingsFunc;
  setSettings: SetSettingsFunc;
  getFilterOptions: GetFilterOptionsFunc;
  getExternalExtensions: GetExternalExtensionsFunc;
  convertExternalData: ConvertExternalDataFunc;
}

export abstract class ExtensionClientAbstract implements ExtensionClientInterface {
  webviewFn: WebviewFunc;
  settings: { [key: string]: any } = {};

  constructor(webviewFn: WebviewFunc) {
    this.webviewFn = webviewFn;
  }

  getSeries!: GetSeriesFunc;
  getChapters!: GetChaptersFunc;
  getPageRequesterData!: GetPageRequesterDataFunc;
  getPageUrls!: GetPageUrlsFunc;
  getImage!: GetImageFunc;
  getSearch!: GetSearchFunc;
  getDirectory!: GetDirectoryFunc;
  getSettingTypes!: GetSettingTypesFunc;
  getSettings!: GetSettingsFunc;
  setSettings!: SetSettingsFunc;
  getFilterOptions!: GetFilterOptionsFunc;
  getExternalExtensions!: GetExternalExtensionsFunc;
  convertExternalData!: ConvertExternalDataFunc;
}

export interface TiyoClientInterface {
  spoofWindow: BrowserWindow;

  getVersion: GetVersionFunc;
  getExtensions: GetExtensionsFunc;
}

export abstract class TiyoClientAbstract implements TiyoClientInterface {
  spoofWindow: BrowserWindow;

  constructor(spoofWindow: BrowserWindow) {
    this.spoofWindow = spoofWindow;
  }

  getVersion!: GetVersionFunc;
  getExtensions!: GetExtensionsFunc;
}
