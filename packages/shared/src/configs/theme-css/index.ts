/**
 * CSS 主题导出
 * 将 CSS 文件作为字符串导出供 JavaScript 使用
 */

import baseCSS from './base.css?raw'
import defaultCSS from './default.css?raw'
import eternalReportCSS from './eternal-report.css?raw'
import graceCSS from './grace.css?raw'
import simpleCSS from './simple.css?raw'
import simpleGrayCSS from './simple_gray.css?raw'
import spaceCSS from './space.css?raw'
import techBlogCSS from './tech_blog.css?raw'
import topwarGameCSS from './topwar_game.css?raw'

/**
 * 基础样式 CSS
 */
export const baseCSSContent = baseCSS

/**
 * CSS 主题映射表
 */
export const themeMap = {
  default: defaultCSS,
  'eternal-report': eternalReportCSS,
  grace: graceCSS,
  simple: simpleCSS,
  simple_gray: simpleGrayCSS,
  tech_blog: techBlogCSS,
  topwar_game: topwarGameCSS,
  space: spaceCSS,
} as const

export type ThemeName = keyof typeof themeMap
