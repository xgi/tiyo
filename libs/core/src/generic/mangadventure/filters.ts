export enum FilterControlIds {
  Sort = 'sort',
  Author = 'author',
  Artist = 'artist',
  Status = 'status',
  Categories = 'categories',
}

export const SORT_FIELDS: {
  key: string, label: string
}[] = [
  { key: 'title', label: 'Title' },
  { key: 'views', label: 'Views' },
  { key: 'latest_upload', label: 'Latest Upload' },
  { key: 'chapter_count', label: 'Chapter Count' },
];

export const STATUS_OPTIONS: {
  value: string, label: string
}[] = [
  { value: 'any', label: 'Any' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'canceled', label: 'Canceled' },
];

export const DEFAULT_CATEGORIES: string[] = [
 '4-Koma',
 'Action',
 'Adventure',
 'Comedy',
 'Doujinshi',
 'Drama',
 'Ecchi',
 'Fantasy',
 'Gender Bender',
 'Harem',
 'Hentai',
 'Historical',
 'Horror',
 'Josei',
 'Martial Arts',
 'Mecha',
 'Mystery',
 'Psychological',
 'Romance',
 'School Life',
 'Sci-Fi',
 'Seinen',
 'Shoujo',
 'Shoujo Ai',
 'Shounen',
 'Shounen Ai',
 'Slice of Life',
 'Smut',
 'Sports',
 'Supernatural',
 'Tragedy',
 'Yaoi',
 'Yuri',
];
