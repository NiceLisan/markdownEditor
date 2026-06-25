# 微信公众号图片超链接跳转方案

## 背景说明

在标准 Markdown 语法中，如果希望图片支持点击跳转，应当使用**图片包裹在超链接中**的语法组合：

```markdown
[![替代文字](图片路径)](跳转链接)
```

然而，这段标准语法默认会转换为如下的 HTML 结构：

```html
<a href="跳转链接">
  <figure>
    <img src="图片路径" alt="替代文字" />
  </figure>
</a>

```

在微信公众号的富文本编辑器和沙箱环境中，由于安全限制和自定义排版引擎规则，上述包含 `<figure>` 的标准链接结构通常无法正常识别为"可点击跳转的图片"，导致文章在微信中发布后点击图片没有任何反应，或者图片直接被微信编辑器过滤并剥离链接。

## 解决方案

为了解决这一问题，本项目中的 Markdown 渲染器专门在底层实现了一套针对"图片处于链接内"（The image is the sole content inside a link）这一特征的拦截与专项渲染规则。

当使用如下语法：

```markdown
[![点击跳转Doocs](https://example.com/cover.png)](https://mp.weixin.qq.com/.../)
```

渲染器会自动在底层将 HTML 结构替换为完全符合微信官方规范定义的专有 DOM 树。微信公众号底层认可的带超链接图片的 HTML 结构包含特定的 `data-*` 参数及微信组件类名：

```html
<section style="display: inline-block; line-height: 0; height: auto !important; box-sizing: border-box">
  <a
    data-itemshowtype="0"
    data-linktype="1"
    href="跳转链接"
    imgurl="图片路径"
    linktype="image"
    tab="innerlink"
    target="_blank"
  >
    <span class="js_jump_icon h5_image_link">
      <img
        class="rich_pages wxw-img"
        src="图片路径"
        alt="替代文字"
        style="vertical-align: middle; box-sizing: border-box; max-width: 100%; height: auto"
      />
    </span>
  </a>
</section>

```

### 为什么必须使用这种结构？

1. `linktype="image"` 与 `data-linktype="1"`：微信内部标识该链接是以图片为载体。
2. `<span class="js_jump_icon h5_image_link">`：微信编辑器用来绑定点击（Tap/Click）并跳转原生页面的特定钩子。
3. `class="rich_pages wxw-img"`：确保图片能在微信内自适应手机屏幕且享有基础图文排版规则。

## 如何使用

在日常编写文章时，您**无需**手动编写复杂的 HTML 标签。您只需在原始文本中严格使用标准的 Markdown 组合语法即可：

```markdown
<!-- 示例：点击大图跳转到特定的微信内部文章 -->

[![点击查看2024年回顾报告](https://example.com/2024-report-banner.jpg)](https://mp.weixin.qq.com/s/123456789)

```

**注意事项**：

- 微信公众号文章内默认**仅允许**普通外链在通过微信审核的白名单域名上生效，通常只有特定的媒体号机构享有该特权。
- 但是，所有的公众号**普通号**，均完美支持跳转到**站内链接**（即以 `https://mp.weixin.qq.com/s` 开头的过往文章链接或小程序路径）。因此强烈建议跳转链接填写微信域内地址。
