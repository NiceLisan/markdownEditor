import type { IConfigOption } from '../types'
import type { ThemeName } from './theme-css'

// 导出 CSS 主题（新主题系统）
export { baseCSSContent, themeMap, type ThemeName } from './theme-css'

export const themeOptionsMap = {
  default: {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  grace: {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  simple: {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  simple_gray: {
    label: `简约浅灰`,
    value: `simple_gray`,
    desc: ``,
  },
  tech_blog: {
    label: `技术博客`,
    value: `tech_blog`,
    desc: `TRAE`,
  },
  topwar_game: {
    label: `口袋奇兵`,
    value: `topwar_game`,
    desc: `@chengcheng`,
  },
  space: {
    label: `航天`,
    value: `space`,
    desc: ``,
  },
}

export const themeOptions: IConfigOption<ThemeName>[] = [
  {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  {
    label: `简约浅灰`,
    value: `simple_gray`,
    desc: ``,
  },
  {
    label: `技术博客`,
    value: `tech_blog`,
    desc: `TRAE`,
  },
  {
    label: `口袋奇兵`,
    value: `topwar_game`,
    desc: `@chengcheng`,
  },
  {
    label: `航天`,
    value: `space`,
    desc: ``,
  },
]
