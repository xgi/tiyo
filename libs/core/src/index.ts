import { TiyoClientAbstract, WebviewFunc } from '@tiyo/common';
import * as mangadex from './extensions/mangadex';
import { BrowserWindow } from 'electron';
import { loadInWebView } from './util/webview';

export class TiyoClient extends TiyoClientAbstract {
  constructor(spoofWindow: BrowserWindow) {
    super(spoofWindow);
  }

  _webviewFn: WebviewFunc = (url, options) => loadInWebView(this.spoofWindow, url, options);

  // prettier-ignore
  override getExtensions = () => ({
    [mangadex.METADATA.id]: { metadata: mangadex.METADATA, client: new mangadex.ExtensionClient(this._webviewFn) }
  });
}
