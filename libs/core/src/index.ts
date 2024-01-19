import { TiyoClientAbstract, WebviewFunc } from '@tiyo/common';
import * as anatanomotokare from './extensions/anatanomotokare';
import * as arcrelight from './extensions/arcrelight';
import * as assortedscans from './extensions/assortedscans';
import * as comick from './extensions/comick';
import * as deathtollscans from './extensions/deathtollscans';
import * as disasterscans from './extensions/disasterscans';
import * as guya from './extensions/guya';
import * as hniscantrad from './extensions/hniscantrad';
import * as immortalupdates from './extensions/immortalupdates';
import * as isekaiscan from './extensions/isekaiscan';
import * as kireicake from './extensions/kireicake';
import * as komga from './extensions/komga';
import * as komikcast from './extensions/komikcast';
import * as kouhaiwork from './extensions/kouhaiwork';
import * as lecercleduscan from './extensions/lecercleduscan';
import * as leviatanscans from './extensions/leviatanscans';
import * as lilyreader from './extensions/lilyreader';
import * as lupiteam from './extensions/lupiteam';
import * as manga347 from './extensions/manga347';
import * as mangabat from './extensions/mangabat';
import * as mangadex from './extensions/mangadex';
import * as mangakakalot from './extensions/mangakakalot';
import * as mangakatana from './extensions/mangakatana';
import * as mangakik from './extensions/mangakik';
import * as mangalife from './extensions/mangalife';
import * as manganato from './extensions/manganato';
import * as mangapill from './extensions/mangapill';
import * as mangasee from './extensions/mangasee';
import * as mangatellers from './extensions/mangatellers';
import * as menudofansub from './extensions/menudofansub';
import * as nana from './extensions/nana';
import * as nhentai from './extensions/nhentai';
import * as nifteam from './extensions/nifteam';
import * as phoenixscans from './extensions/phoenixscans';
import * as readcomiconline from './extensions/readcomiconline';
import * as sensescans from './extensions/sensescans';
import * as silentsky from './extensions/silentsky';
import * as sleepingknightscans from './extensions/sleepingknightscans';
import * as tcbscans from './extensions/tcb-scans';
import * as toonily from './extensions/toonily';
import * as tortugaceviri from './extensions/tortugaceviri';
import * as tritiniascans from './extensions/tritiniascans';
import * as tuttoanimemanga from './extensions/tuttoanimemanga';
import * as yuriism from './extensions/yuriism';
import * as zandynofansub from './extensions/zandynofansub';
import { BrowserWindow } from 'electron';
import { loadInWebView } from './util/webview';
import packageJson from '../package.json';

export class TiyoClient extends TiyoClientAbstract {
  constructor(spoofWindow: BrowserWindow) {
    super(spoofWindow);
  }

  _webviewFn: WebviewFunc = (url, options) => loadInWebView(this.spoofWindow, url, options);

  // @ts-expect-error version is added to packageJson after build
  override getVersion = () => packageJson.version || '0.0.0';

  // prettier-ignore
  override getExtensions = () => ({
    [anatanomotokare.METADATA.id]: { metadata: anatanomotokare.METADATA, client: new anatanomotokare.ExtensionClient(this._webviewFn)},
    [arcrelight.METADATA.id]: { metadata: arcrelight.METADATA, client: new arcrelight.ExtensionClient(this._webviewFn)},
    [assortedscans.METADATA.id]: { metadata: assortedscans.METADATA, client: new assortedscans.ExtensionClient(this._webviewFn)},
    [comick.METADATA.id]: { metadata: comick.METADATA, client: new comick.ExtensionClient(this._webviewFn)},
    [deathtollscans.METADATA.id]: { metadata: deathtollscans.METADATA, client: new deathtollscans.ExtensionClient(this._webviewFn)},
    [disasterscans.METADATA.id]: { metadata: disasterscans.METADATA, client: new disasterscans.ExtensionClient(this._webviewFn)},
    [guya.METADATA.id]: { metadata: guya.METADATA, client: new guya.ExtensionClient(this._webviewFn)},
    [hniscantrad.METADATA.id]: { metadata: hniscantrad.METADATA, client: new hniscantrad.ExtensionClient(this._webviewFn)},
    [immortalupdates.METADATA.id]: { metadata: immortalupdates.METADATA, client: new immortalupdates.ExtensionClient(this._webviewFn)},
    [isekaiscan.METADATA.id]: { metadata: isekaiscan.METADATA, client: new isekaiscan.ExtensionClient(this._webviewFn)},
    [kireicake.METADATA.id]: { metadata: kireicake.METADATA, client: new kireicake.ExtensionClient(this._webviewFn)},
    [komga.METADATA.id]: { metadata: komga.METADATA, client: new komga.ExtensionClient(this._webviewFn)},
    [komikcast.METADATA.id]: { metadata: komikcast.METADATA, client: new komikcast.ExtensionClient(this._webviewFn)},
    [kouhaiwork.METADATA.id]: { metadata: kouhaiwork.METADATA, client: new kouhaiwork.ExtensionClient(this._webviewFn)},
    [lecercleduscan.METADATA.id]: { metadata: lecercleduscan.METADATA, client: new lecercleduscan.ExtensionClient(this._webviewFn)},
    [leviatanscans.METADATA.id]: { metadata: leviatanscans.METADATA, client: new leviatanscans.ExtensionClient(this._webviewFn)},
    [lilyreader.METADATA.id]: { metadata: lilyreader.METADATA, client: new lilyreader.ExtensionClient(this._webviewFn)},
    [lupiteam.METADATA.id]: { metadata: lupiteam.METADATA, client: new lupiteam.ExtensionClient(this._webviewFn)},
    [manga347.METADATA.id]: { metadata: manga347.METADATA, client: new manga347.ExtensionClient(this._webviewFn)},
    [mangabat.METADATA.id]: { metadata: mangabat.METADATA, client: new mangabat.ExtensionClient(this._webviewFn)},
    [mangadex.METADATA.id]: { metadata: mangadex.METADATA, client: new mangadex.ExtensionClient(this._webviewFn)},
    [mangakakalot.METADATA.id]: { metadata: mangakakalot.METADATA, client: new mangakakalot.ExtensionClient(this._webviewFn)},
    [mangakatana.METADATA.id]: { metadata: mangakatana.METADATA, client: new mangakatana.ExtensionClient(this._webviewFn)},
    [mangakik.METADATA.id]: { metadata: mangakik.METADATA, client: new mangakik.ExtensionClient(this._webviewFn)},
    [mangalife.METADATA.id]: { metadata: mangalife.METADATA, client: new mangalife.ExtensionClient(this._webviewFn)},
    [manganato.METADATA.id]: { metadata: manganato.METADATA, client: new manganato.ExtensionClient(this._webviewFn)},
    [mangapill.METADATA.id]: { metadata: mangapill.METADATA, client: new mangapill.ExtensionClient(this._webviewFn)},
    [mangasee.METADATA.id]: { metadata: mangasee.METADATA, client: new mangasee.ExtensionClient(this._webviewFn)},
    [mangatellers.METADATA.id]: { metadata: mangatellers.METADATA, client: new mangatellers.ExtensionClient(this._webviewFn)},
    [menudofansub.METADATA.id]: { metadata: menudofansub.METADATA, client: new menudofansub.ExtensionClient(this._webviewFn)},
    [nana.METADATA.id]: { metadata: nana.METADATA, client: new nana.ExtensionClient(this._webviewFn)},
    [nhentai.METADATA.id]: { metadata: nhentai.METADATA, client: new nhentai.ExtensionClient(this._webviewFn)},
    [nifteam.METADATA.id]: { metadata: nifteam.METADATA, client: new nifteam.ExtensionClient(this._webviewFn)},
    [phoenixscans.METADATA.id]: { metadata: phoenixscans.METADATA, client: new phoenixscans.ExtensionClient(this._webviewFn)},
    [readcomiconline.METADATA.id]: { metadata: readcomiconline.METADATA, client: new readcomiconline.ExtensionClient(this._webviewFn)},
    [sensescans.METADATA.id]: { metadata: sensescans.METADATA, client: new sensescans.ExtensionClient(this._webviewFn)},
    [silentsky.METADATA.id]: { metadata: silentsky.METADATA, client: new silentsky.ExtensionClient(this._webviewFn)},
    [sleepingknightscans.METADATA.id]: { metadata: sleepingknightscans.METADATA, client: new sleepingknightscans.ExtensionClient(this._webviewFn)},
    [tcbscans.METADATA.id]: { metadata: tcbscans.METADATA, client: new tcbscans.ExtensionClient(this._webviewFn)},
    [toonily.METADATA.id]: { metadata: toonily.METADATA, client: new toonily.ExtensionClient(this._webviewFn)},
    [tortugaceviri.METADATA.id]: { metadata: tortugaceviri.METADATA, client: new tortugaceviri.ExtensionClient(this._webviewFn)},
    [tritiniascans.METADATA.id]: { metadata: tritiniascans.METADATA, client: new tritiniascans.ExtensionClient(this._webviewFn)},
    [tuttoanimemanga.METADATA.id]: { metadata: tuttoanimemanga.METADATA, client: new tuttoanimemanga.ExtensionClient(this._webviewFn)},
    [yuriism.METADATA.id]: { metadata: yuriism.METADATA, client: new yuriism.ExtensionClient(this._webviewFn)},
    [zandynofansub.METADATA.id]: { metadata: zandynofansub.METADATA, client: new zandynofansub.ExtensionClient(this._webviewFn)},
  });
}
