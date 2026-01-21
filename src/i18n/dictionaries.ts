import type { Locale } from './config'

import tr from './dictionaries/tr.json'
import en from './dictionaries/en.json'
import es from './dictionaries/es.json'
import ru from './dictionaries/ru.json'

const dictionaries: Record<Locale, typeof tr> = {
  tr,
  en,
  es,
  ru,
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] || dictionaries.tr
}
