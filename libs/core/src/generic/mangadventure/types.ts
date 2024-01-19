/** Generic results wrapper schema. */
export type APIResults<T> = {
  results: T[];
}

/** Paginator wrapper schema. */
export type APIPaginator<T> = APIResults<T> & {
  total: number;
  last: boolean;
}

/** Category model schema. */
export type APICategory = {
    name: string;
    description: string;
}

/** Page model schema. */
export type APIPage = {
    id: number;
    image: string;
    number: number;
    url: string;
}

/** Chapter model schema. */
export type APIChapter = {
    id: number;
    title: string;
    number: number;
    volume: number | null;
    published: string;
    final: boolean;
    series: string;
    groups: string[];
    full_title: string;
    url: string;
}

/** Base series model schema. */
export type APISeriesBase = {
    slug: string;
    title: string;
    url: string;
    cover: string;
    updated: string;
    chapters?: number | null;
}

/** Extended series model schema. */
export type APISeries = APISeriesBase & {
    views: number;
    description: string;
    completed: boolean;
    licensed: boolean;
    aliases: string[];
    authors: string[];
    artists: string[];
    categories: string[];
    status: 'ongoing' | 'completed' | 'hiatus' | 'canceled';
}
