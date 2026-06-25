import type { MarkedExtension } from 'marked'

/**
 * Top War Theme Extensions
 * Parses custom containers like :::topwar-intro, :::video, etc.
 */
export function markedTopwar(): MarkedExtension {
  // Capture: 1. Type, 2. Optional title on same line, 3. Multiline content
  const containerRegex = /^:::\s*(topwar-intro|video|topwar-data|topwar-buff|topwar-bubble|topwar-tip|topwar-head|topwar-review|topwar-end)([^\n]*)\n([\s\S]*?)\n:::/;
  
  return {
    extensions: [
      {
        name: 'topwarContainer',
        level: 'block',
        start(src) {
          return src.match(/^:::\s*(?:topwar|video)/m)?.index;
        },
        tokenizer(src, _tokens) {
          const match = containerRegex.exec(src);
          if (match) {
            const [raw, type, title = '', content = ''] = match;
            console.log(`[TopWar] Detected ${type} with title: "${title.trim()}"`);
            return {
              type: 'topwarContainer',
              raw,
              containerType: type,
              containerTitle: title.trim(), // Keep raw title, will handle braces in renderer
              text: content.trim(),
              tokens: this.lexer.blockTokens(content.trim()),
            };
          }
          return undefined;
        },
        renderer(token) {
          const type = token.containerType;
          console.log('[DEBUG] topwar renderer called for type:', type);
          const text = this.parser.parse(token.tokens || []);

          if (type === 'video') {
            const lines = token.text.split('\n');
            const nickname = lines[0]?.trim() || '';
            const desc = lines[1]?.trim() || '';
            const defaultUrl = 'https://findermp.video.qq.com/251/20304/stodownload?encfilekey=rjD5jyTuFrIpZ2ibE8T7YmwgiahniaXswqzpDGFLhxs5we4IO1LcRzududuGFb3nF0kjdG92LIYwibL7gchS8ndnlrE6HMjIg8DegGutbPWElQsz0KMIZuPLtw&token=6xykWLEnztLM3B55Xd7sogtiaN5GtkTz4piaPosBlzBVI7hWbQrCtAwQQaqxwmD1nic8rspkrA06dicJpVDoR0kuMu1lSzcMd9CNGuS2CbTX4HvFzTqJ5TL1eatzIJSwb3CdTTv5T12l4wo9icr7CPQwiarAMnibDciajyIDS1LszT4fLK8zegoOVfr1yHnwlkh8kGoFom2rIYBO8yx6Hbxj6q0oCDU5W5z2Od4LnGqe9k0kZpo&hy=SH&idx=1&m=&scene=2&uzid=1&wxampicformat=503&picformat=200';
            const url = lines[2]?.trim() || defaultUrl;
            return `
<section style="margin: 10px auto;border: 2px solid var(--md-primary-color, #4154b5);border-radius: 10px;background-color: #f0f5ff;box-sizing:border-box;">
  <section style="background-color: var(--md-primary-color, #4154b5);padding: 5px 10px 5px 20px;box-sizing:border-box;">
    <section style="display: flex;justify-content: space-between;">
      <section style="display: flex;">
        <section style="width: 25px;box-sizing:border-box;">
          <img src="https://mmbiz.qpic.cn/mmbiz_png/XkZ04otWBIYGVW52jE7hAmcVo9c2k9JWa9RmgSAcMnsep58p2x7naup2wGZMGibWlmepzLrhlelnZtdv2KedIvk9ZbBlEbKB8mtwsmENPiaeg/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" data-type="png" style="width: 100%;display: block;vertical-align:baseline;box-sizing:border-box;max-width:100% !important;" />
        </section>
        <section style="width: 25px;margin-left: 7px;box-sizing:border-box;">
          <img src="https://mmbiz.qpic.cn/mmbiz_png/XkZ04otWBIYa3W3MWR5fSMpA3TgPiaxgItV8ujSEOG3hpKwlCGY79usq5zkibD1Xx3lhDwZlWUL2Apzia8tT0eKZdnXzdGxAWSKQswwVWcmVCE/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" data-type="png" style="width: 100%;display: block;vertical-align:baseline;box-sizing:border-box;max-width:100% !important;" />
        </section>
        <section style="width: 25px;margin-left: 7px;box-sizing:border-box;">
          <img src="https://mmbiz.qpic.cn/mmbiz_png/XkZ04otWBIZEibUIDwAmwKoBtnDDzT0bunGH4HB4oTaK7DlQCVj5oYAsnhwrJD0PEU2zelsDT6OekWo2F56JkzQnUJgWXMe8T5a0ibrdF84Eg/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" data-type="png" style="width: 100%;display: block;vertical-align:baseline;box-sizing:border-box;max-width:100% !important;" />
        </section>
      </section>
      <section style="display: flex;align-items: center;">
        <section style="width: 20px;box-sizing:border-box;">
          <svg data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.94 30.93" style="display: block;" xml:space="default">
            <g data-name="图层 1">
              <g>
                <path d="m6.5.5h17.94c3.31,0,6,2.69,6,6v17.93c0,3.31-2.69,6-6,6H6.5c-3.31,0-6-2.69-6-6V6.5C.5,3.19,3.19.5,6.5.5Z" style="fill: #fff;fill-rule: evenodd;stroke: var(--md-primary-color, #4154b5);"></path>
                <path d="m8.72,13.22h14c1.1,0,2,.9,2,2s-.9,2-2,2h-14c-1.1,0-2-.9-2-2s.9-2,2-2Z" style="fill: var(--md-primary-color, #4154b5);fill-rule: evenodd;stroke-width: 0px;"></path>
              </g>
            </g>
          </svg>
        </section>
        <section style="width: 20px;margin: 0 7px;box-sizing:border-box;">
          <svg data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.94 30.93" style="display: block;" xml:space="default">
            <g data-name="图层 1">
              <g>
                <path d="m6.5.5h17.94c3.31,0,6,2.69,6,6v17.93c0,3.31-2.69,6-6,6H6.5c-3.31,0-6-2.69-6-6V6.5C.5,3.19,3.19.5,6.5.5Z" style="fill: #fff;fill-rule: evenodd;stroke: var(--md-primary-color, #4154b5);"></path>
                <path d="m6.84,7.5h11.54v8.44H6.84V7.5Z" style="fill: #fff;fill-rule: evenodd;stroke: var(--md-primary-color, #4154b5);stroke-linecap: round;stroke-linejoin: round;stroke-width: 2px;"></path>
                <path d="m11.04,12.46h14.15v10.5h-14.15v-10.5Z" style="fill: #fff;fill-rule: evenodd;stroke: var(--md-primary-color, #4154b5);stroke-linecap: round;stroke-linejoin: round;stroke-width: 2px;"></path>
              </g>
            </g>
          </svg>
        </section>
        <section style="width: 20px;box-sizing:border-box;">
          <svg data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.94 30.93" style="display: block;" xml:space="default">
            <g data-name="图层 1">
              <g>
                <path d="m6.5.5h17.94c3.31,0,6,2.69,6,6v17.93c0,3.31-2.69,6-6,6H6.5c-3.31,0-6-2.69-6-6V6.5C.5,3.19,3.19.5,6.5.5Z" style="fill: #fff;fill-rule: evenodd;stroke: var(--md-primary-color, #4154b5);"></path>
                <path d="m17.93,15.21l3.57,3.57c.78.78.78,2.05,0,2.83l-.02.02c-.78.78-2.05.78-2.83,0l-3.57-3.57-3.53,3.53c-.78.78-2.05.78-2.83,0-.78-.78-.78-2.05,0-2.83l3.53-3.53-3.62-3.62c-.78-.78-.78-2.05,0-2.83l.02-.03c.78-.78,2.05-.78,2.83,0l3.62,3.62,3.52-3.52c.78-.78,2.05-.78,2.83,0,.78.78.78,2.05,0,2.83l-3.52,3.51Z" style="fill: var(--md-primary-color, #4154b5);fill-rule: evenodd;stroke-width: 0px;"></path>
              </g>
            </g>
          </svg>
        </section>
      </section>
    </section>
  </section>
  <section style="padding: 26px 15px;box-sizing:border-box;">
    <section data-autoskip="1" style="text-align: justify;line-height:1.75em;letter-spacing: 1.5px;font-size:14px;color:#333333;background-color: transparent;margin-bottom:-13px;">
      <section class="js_uneditable custom_select_card channels_iframe videosnap_video_iframe videosnap_video_iframe _135editor">
        <mp-common-videosnap data-pluginname="mpvideosnap" data-url="${url}" data-headimgurl="https://wx.qlogo.cn/finderhead/Y3WgNLFjO0dXaLeLdzibJm5rpgPgDGAgeBq3qp3ge2QPyVjF5Z4AEEQ/0" data-username="v2_060000231003b20faec8c6e4801cc4d1cc03e530b07786bd8f28a98d95f07f02a4a1ab8e4ec5@finder" data-nickname="${nickname}" data-desc="${desc}" data-nonceid="6439368205312511063" data-authiconurl="https://dldir1v6.qq.com/weixin/checkresupdate/icons_filled_channels_authentication_enterprise_a2658032368245639e666fb11533a600.png" data-width="1920" data-height="1440" data-type="video" data-id="export/UzFfBgAAxNGHbFJ7HxajjczT4DCLNzbM9rY7XusqI7Vdv1iGnQ"></mp-common-videosnap>
      </section>
    </section>
  </section>
</section>\n`;
          }

          if (type === 'topwar-intro') {
            return `
<section style="margin: 0px;padding: 0px;max-width: 100%;overflow-wrap: break-word !important;box-sizing: border-box !important;">
  <section data-width="100%" style="margin: 0px;padding: 0px;max-width: 100%;width: 100%;overflow-wrap: break-word !important;box-sizing:border-box;" class="">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 19.62" style="display: block;" xml:space="default">
      <path style="fill: #f7f9ff;fill-rule: evenodd;" d="M373,2006s4.384,8.75,49,2c47.467-7.19,73.57-15.38,122-4,39.9,9.38,74.18,5.11,107,0,56.1-8.73,98.266-6.54,144,3,46.284,9.66,70.622-6.14,108-7,18-.42,50,18,50,18H373v-12Z" transform="translate(-373 -1998.38)"></path>
    </svg>
  </section>
  <section style="margin: 0px;padding: 15px;max-width: 100%;background-color: #f7f9ff;overflow-wrap: break-word !important;box-sizing: border-box !important;" class="">
    <section data-autoskip="1" style="margin: 0px;padding: 0px;max-width: 100%;line-height: 1.75em;letter-spacing: 1.5px;font-size: 14px;background-color: transparent;overflow-wrap: break-word !important;box-sizing: border-box !important;" class="">
      ${text}
    </section>
  </section>
</section>\n`;
          }

          if (type === 'topwar-data') {
            const title = token.containerTitle || '-首周数据透视-';
            return `
<section style="margin: 10px auto;">
  <section style="display: flex;align-items: center;">
    <section style="flex-shrink: 0;padding: 0 5px 0 0;box-sizing:border-box;">
      <section style="border: 1px solid #724b3b;border-radius: 25px;padding: 1px;box-sizing:border-box;">
        <section style="background-color: var(--md-primary-color, #4154b5);border-radius: 25px;padding: 3px 15px;box-sizing:border-box;">
          <section style="font-size: 14px;color: #ffffff;text-align: center;">
            <span style="font-size:14px;color: #ffffff;"><strong data-brushtype="text" style="color: #ffffff;"><span style="color: #ffffff;">${title}</span></strong></span>
          </section>
        </section>
      </section>
    </section>
    <section style="width: 100%;border-top: 1px dashed #724b3b;max-width: 100% !important;height: 1px;box-sizing:border-box;" data-width="100%">
      <p><br/></p>
    </section>
  </section>
  <section style="background-color: #fffcf3;padding: 25px 15px 10px;margin: -10px 0 -5px;box-sizing:border-box;">
    <section data-autoskip="1" style="text-align: justify;line-height:1.75em;letter-spacing: 1.5px;font-size:14px;color:#333333;background-color: transparent;">
      ${text}
    </section>
  </section>
  <section style="display: flex;align-items: center;">
    <section style="width: 100%;border-top: 1px dashed #724b3b;max-width: 100% !important;height: 1px;box-sizing:border-box;" data-width="100%">
      <p><br/></p>
    </section>
    <section style="flex-shrink: 0;padding: 0 0 0 5px;box-sizing:border-box;">
      <section style="width: 45px;box-sizing:border-box;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276.86 128.93" style="display: block;" xml:space="default">
          <g data-name="图层 2">
            <g data-name="图层 1">
              <g><path d="M213,.11a7.85,7.85,0,0,1,7.14,7.34,66.41,66.41,0,0,0,6.14,22.38,44.18,44.18,0,0,0,23,21.72,67,67,0,0,0,18.65,4.9,23.62,23.62,0,0,1,2.76.43,7.42,7.42,0,0,1,5.84,5.86c.08.35.15.71.22,1.06s-.06,1,.11,1.41v.13c-.3.33-.27.78-.38,1.17A7.29,7.29,0,0,1,271.05,72a57.82,57.82,0,0,1-6.15,1,59.14,59.14,0,0,0-23,8.39,42.65,42.65,0,0,0-14.88,16.32A62.11,62.11,0,0,0,220.77,117a55.25,55.25,0,0,1-1,6.27,7.38,7.38,0,0,1-5.32,5.31,7.89,7.89,0,0,1-9-3.5,9.74,9.74,0,0,1-1.14-4,64.73,64.73,0,0,0-7-23.75,44,44,0,0,0-22-19.88,66.75,66.75,0,0,0-18.45-4.89,25.91,25.91,0,0,1-3-.46A7.54,7.54,0,0,1,148,66.25a8,8,0,0,1,3.78-8.63,10.6,10.6,0,0,1,4-1.06,65,65,0,0,0,23.42-6.89,44.11,44.11,0,0,0,20.31-22.49,66.36,66.36,0,0,0,4.64-17.46,23.11,23.11,0,0,1,.68-4.13A7.37,7.37,0,0,1,209.91.46a6.37,6.37,0,0,1,1.67-.35A4.64,4.64,0,0,1,213,.11Z" style="fill:#724b3b;"></path></g>
              <g><path d="M213,.11h-1.44l0-.11H213A.2.2,0,0,0,213,.11Z" style="fill:#a38a80;"></path></g>
              <g><path d="M99.47,59.46a7.8,7.8,0,0,1-5.93,7.7c-2.24.5-4.54.62-6.78,1.11A38.52,38.52,0,0,0,69.9,75.93a31.81,31.81,0,0,0-9.18,12.95,47.91,47.91,0,0,0-3.09,12.75,7.92,7.92,0,0,1-14.08,4.68,10.29,10.29,0,0,1-1.84-5.46,42.41,42.41,0,0,0-6-17.94,30.58,30.58,0,0,0-14-11.79,46.87,46.87,0,0,0-14-3.62A8,8,0,0,1,1.1,63.63a8,8,0,0,1,2-10.33,10.35,10.35,0,0,1,5.25-1.71A44,44,0,0,0,25,46.38,31,31,0,0,0,38.62,30.52a49,49,0,0,0,3.22-13.17A7.91,7.91,0,0,1,56.5,13.74a9.15,9.15,0,0,1,1.14,3.94,44.71,44.71,0,0,0,5.17,17A30.7,30.7,0,0,0,77.7,48,46.67,46.67,0,0,0,91.18,51.6a10.07,10.07,0,0,1,5,1.61A8,8,0,0,1,99.47,59.46Z" style="fill:#724b3b;"></path></g>
              <g><path d="M150.55,64.51c0-2.85,2-4.81,5.21-5.17a70.14,70.14,0,0,0,22.66-6.16c11.76-5.63,19.74-14.69,24.38-26.79a73.74,73.74,0,0,0,4.1-16.62c.12-.88.22-1.77.35-2.65a5.09,5.09,0,0,1,5.15-4.29,5.15,5.15,0,0,1,4.95,4.6c1,8.48,2.9,16.7,6.8,24.36A47,47,0,0,0,248.8,54.38,71.18,71.18,0,0,0,266,59c1.22.18,2.44.32,3.66.49a5.08,5.08,0,0,1-.16,10.08,76,76,0,0,0-20.57,5c-13.6,5.62-22.7,15.48-27.64,29.27a75.34,75.34,0,0,0-3.72,15.87c-.11.87-.18,1.74-.37,2.58a5,5,0,0,1-5,3.88,5,5,0,0,1-4.91-4.25,104.4,104.4,0,0,0-2-11.52A56.07,56.07,0,0,0,195.88,90a47.76,47.76,0,0,0-21.34-15.82,73.12,73.12,0,0,0-16.8-4.22c-1.11-.15-2.24-.24-3.33-.49A5,5,0,0,1,150.55,64.51Z" style="fill:#fefefe;"></path></g>
              <g><path d="M96.66,59.64c0,2.72-2,4.75-5,5.07a48,48,0,0,0-18.79,5.73c-7.7,4.42-12.66,11.06-15.51,19.37a54.41,54.41,0,0,0-2.58,11.84,5.17,5.17,0,0,1-4.61,4.82,5,5,0,0,1-5.37-3.66c-.32-1.22-.39-2.51-.59-3.76C43.12,91.79,40.89,85,36.37,79A34.75,34.75,0,0,0,19.44,67.26,55.2,55.2,0,0,0,7.59,64.69,5.1,5.1,0,0,1,7.51,54.5a49.73,49.73,0,0,0,18.26-5.35C33.78,44.79,39,38.09,42,29.57A55.45,55.45,0,0,0,44.64,17.3a5.1,5.1,0,0,1,4.93-4.61,5,5,0,0,1,5.15,4.25,70.57,70.57,0,0,0,2.05,10.4A36.58,36.58,0,0,0,66.4,43.85a37,37,0,0,0,15.32,8.61A57.21,57.21,0,0,0,92,54.5,5.1,5.1,0,0,1,96.66,59.64Z" style="fill:#fefefe;"></path></g>
              <g><path d="M212.35,8.67c1.09,8.94,3.22,17.58,7.36,25.65,6.19,12.07,15.8,20.34,28.37,25.27a78.29,78.29,0,0,0,18.52,4.62l1.7.23c.07,0,.12,0,.29.09-2.64.32-5.16.69-7.66,1.19a66.52,66.52,0,0,0-22.37,8.42,51.63,51.63,0,0,0-20.32,23.6A74,74,0,0,0,213,115.82c-.25,1.51-.44,3-.66,4.53-.33,0-.07-.37-.22-.5-1.18-9.36-3.52-18.38-8.12-26.71-6.23-11.3-15.57-19-27.51-23.71A77.44,77.44,0,0,0,159.05,65c-1-.15-2-.28-3.2-.44,1.44-.21,2.72-.37,4-.57,10.06-1.57,19.6-4.58,28.11-10.36a52.12,52.12,0,0,0,19.33-24.65A78.23,78.23,0,0,0,212,10.05c0-.29.09-.58.13-.88C212.28,9,212,8.73,212.35,8.67Z" style="fill:#fea700;"></path></g>
              <g><path d="M212.35,8.67l-.22.5c0-.16,0-.32,0-.48a.94.94,0,0,1,.2-.43Z" style="fill:#febf45;"></path></g>
              <g><path d="M212.13,119.85l.22.5a.54.54,0,0,1,0,.43A1.67,1.67,0,0,1,212.13,119.85Z" style="fill:#fec14b;"></path></g>
              <g><path d="M49.85,18.74c1.17,9.35,3.89,18.1,9.94,25.54a39.53,39.53,0,0,0,18,12.26A65.83,65.83,0,0,0,91.14,59.6c-1.14.17-2.28.33-3.41.52A49.39,49.39,0,0,0,68,67.47,38.72,38.72,0,0,0,53.06,86.79a60.33,60.33,0,0,0-3.21,13.45c-.14.08.11.4-.22.37a54.74,54.74,0,0,0-5.82-19.5C39,72.18,31.63,66.25,22.16,62.8A59.36,59.36,0,0,0,8.94,59.72c-.13,0-.25,0-.38-.06l-.35-.12A62.83,62.83,0,0,0,20.9,56.81a40.52,40.52,0,0,0,17.15-10.7,41.81,41.81,0,0,0,9.38-16.86,59.39,59.39,0,0,0,2.2-10.89C50,18.34,49.7,18.66,49.85,18.74Z" style="fill:#fea700;"></path></g>
              <g><path d="M49.85,18.74l-.22-.38v-.48A1.07,1.07,0,0,1,49.85,18.74Z" style="fill:#fed890;"></path></g>
              <g><path d="M49.63,100.61l.22-.37a1.27,1.27,0,0,1-.14.78C49.56,100.9,49.63,100.75,49.63,100.61Z" style="fill:#febf46;"></path></g>
            </g>
          </g>
        </svg>
      </section>
    </section>
  </section>
</section>\n`;
          }

          if (type === 'topwar-buff') {
            return `<section class="topwar-buff">${text}</section>\n`;
          }

          if (type === 'topwar-bubble') {
            let avatarUrl = 'https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzOZvQcFIOZwV9wyCicC9gLJcnWgMpZj97mibF2FCDtcMOZicXdf5ibFQMe4Ug3Bu9rbVAQODpu8kfkWNQ/640?wx_fmt=png&from=appmsg';
            const rawTitle = token.containerTitle || '';
            
            // Handle both {path} and raw path, and markdown image ![](url)
            const contentInsideBraces = rawTitle.match(/^\{(.*)\}$/)?.[1] || rawTitle;
            const markdownImgMatch = contentInsideBraces.match(/!\[.*?\]\((.*?)\)/);
            
            if (markdownImgMatch) {
              avatarUrl = markdownImgMatch[1];
            } else if (contentInsideBraces.trim()) {
              avatarUrl = contentInsideBraces.trim();
            }
            
            console.log(`[TopWar] Bubble Avatar URL: ${avatarUrl}`);

            return `
<section style="text-decoration: none;caret-color: #000000;color: #000000;text-align: left;justify-content: flex-start;display: flex;flex-flow: row;box-sizing: border-box;max-width: 100%;transform: translate3d(8px, 0px, 0px);-webkit-transform: translate3d(8px, 0px, 0px);-moz-transform: translate3d(8px, 0px, 0px);-o-transform: translate3d(8px, 0px, 0px);">
	<section style="font-size: 17px;display: inline-block;vertical-align: top;width: 40px;align-self: flex-start;flex: 0 0 auto;height: auto;margin-bottom: 0em;max-width: 100%;box-sizing:border-box;">
		<section style="max-width: 100%;display: inline-block;width: 40px;box-sizing:border-box;">
			<section style="max-width: 100%;width: 40px;box-sizing:border-box;">
				<section style="max-width: 100%;margin-top: 2px;margin-bottom: 2px;transform-origin: center center;box-sizing: border-box;transform: scale(1.1);-webkit-transform: scale(1.1);-moz-transform: scale(1.1);-o-transform: scale(1.1);">
					<section style="max-width: 100%;margin-left: 0px;margin-right: 0px;margin-bottom: 0em;box-sizing: border-box;">
						<section style="line-height: 0;text-align: center;box-sizing: border-box;max-width: 100%;">
							<section style="max-width: 100%;vertical-align: middle;display: inline-block;line-height: 0;width: 40px;height: auto;border-width: 0px;border-style: solid;border-color: #821e1e;margin-bottom: 0em;border-radius: 20px;overflow: hidden;box-sizing:border-box;">
								<img src="${avatarUrl}" class="rich_pages wxw-img" data-type="png" style="vertical-align: middle;width: 100%;height: auto !important;box-sizing:border-box;max-width:100% !important;" width="100%" data-aistatus="1" draggable="false" />
							</section>
						</section>
					</section>
				</section>
			</section>
		</section>
	</section>
	<section style="font-size: 17px;display: inline-block;vertical-align: top;width: auto;align-self: flex-start;flex: 0 0 0%;height: auto;border-width: 0px;margin-left: 10px;margin-bottom: 0em;box-sizing:border-box;">
		<section style="display: contents;box-sizing: border-box;">
			<section style="text-align: center;justify-content: center;display: flex;flex-flow: row;margin: 9px 0px 0em;box-sizing: border-box;max-width: 100%;height: 0px;">
				<p><br/></p>
			</section>
		</section>
	</section>
	<section style="display: inline-block;vertical-align: top;width: auto;align-self: flex-start;flex: 100 100 0%;height: auto;background-color: rgba(189,183,186,0.30);margin: 0px 30px 0px 0px;padding: 16px 10px;box-sizing:border-box;">
		<section style="max-width: 100%;margin-left: 0px;margin-right: 0px;margin-bottom: 0em;box-sizing: border-box;">
			<section style="text-align: center;box-sizing: border-box;max-width: 100%;">
				<section style="text-align: justify;padding: 0px 10px;box-sizing: border-box;">
					${text}
				</section>
			</section>
		</section>
	</section>
</section>\n`;
          }

          if (type === 'topwar-tip') {
            let iconUrl = 'https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzOr9w3w1UMylbDchsGwf9UKolXfU1eFOERU3Nq4xx3MIQpjkxBM06EcOXGwDGGXP8U3INx87r2mpw/640?wx_fmt=png&from=appmsg';
            const rawTitle = token.containerTitle || '';
            
            // Handle both {path} and raw path, and markdown image ![](url)
            const contentInsideBraces = rawTitle.match(/^\{(.*)\}$/)?.[1] || rawTitle;
            const markdownImgMatch = contentInsideBraces.match(/!\[.*?\]\((.*?)\)/);
            
            if (markdownImgMatch) {
              iconUrl = markdownImgMatch[1];
            } else if (contentInsideBraces.trim()) {
              iconUrl = contentInsideBraces.trim();
            }

            return `
<section style="margin: 10px auto;">
	<section style="display: flex;align-items: center;">
		<section style="width: 100%;border-top: 1px dashed #724b3b;max-width: 100% !important;height: 1px;box-sizing:border-box;" data-width="100%">
			<p><br/></p>
		</section>
		<section style="flex-shrink: 0;padding: 0 0 0 5px;box-sizing:border-box;">
			<section style="width: 45px;box-sizing:border-box;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276.86 128.93" style="display: block;" xml:space="default">
					<g data-name="图层 2">
						<g data-name="图层 1">
							<g><path d="M213,.11a7.85,7.85,0,0,1,7.14,7.34,66.41,66.41,0,0,0,6.14,22.38,44.18,44.18,0,0,0,23,21.72,67,67,0,0,0,18.65,4.9,23.62,23.62,0,0,1,2.76.43,7.42,7.42,0,0,1,5.84,5.86c.08.35.15.71.22,1.06s-.06,1,.11,1.41v.13c-.3.33-.27.78-.38,1.17A7.29,7.29,0,0,1,271.05,72a57.82,57.82,0,0,1-6.15,1,59.14,59.14,0,0,0-23,8.39,42.65,42.65,0,0,0-14.88,16.32A62.11,62.11,0,0,0,220.77,117a55.25,55.25,0,0,1-1,6.27,7.38,7.38,0,0,1-5.32,5.31,7.89,7.89,0,0,1-9-3.5,9.74,9.74,0,0,1-1.14-4,64.73,64.73,0,0,0-7-23.75,44,44,0,0,0-22-19.88,66.75,66.75,0,0,0-18.45-4.89,25.91,25.91,0,0,1-3-.46A7.54,7.54,0,0,1,148,66.25a8,8,0,0,1,3.78-8.63,10.6,10.6,0,0,1,4-1.06,65,65,0,0,0,23.42-6.89,44.11,44.11,0,0,0,20.31-22.49,66.36,66.36,0,0,0,4.64-17.46,23.11,23.11,0,0,1,.68-4.13A7.37,7.37,0,0,1,209.91.46a6.37,6.37,0,0,1,1.67-.35A4.64,4.64,0,0,1,213,.11Z" style="fill:#724b3b;"></path></g>
							<g><path d="M213,.11h-1.44l0-.11H213A.2.2,0,0,0,213,.11Z" style="fill:#a38a80;"></path></g>
							<g><path d="M99.47,59.46a7.8,7.8,0,0,1-5.93,7.7c-2.24.5-4.54.62-6.78,1.11A38.52,38.52,0,0,0,69.9,75.93a31.81,31.81,0,0,0-9.18,12.95,47.91,47.91,0,0,0-3.09,12.75,7.92,7.92,0,0,1-14.08,4.68,10.29,10.29,0,0,1-1.84-5.46,42.41,42.41,0,0,0-6-17.94,30.58,30.58,0,0,0-14-11.79,46.87,46.87,0,0,0-14-3.62A8,8,0,0,1,1.1,63.63a8,8,0,0,1,2-10.33,10.35,10.35,0,0,1,5.25-1.71A44,44,0,0,0,25,46.38,31,31,0,0,0,38.62,30.52a49,49,0,0,0,3.22-13.17A7.91,7.91,0,0,1,56.5,13.74a9.15,9.15,0,0,1,1.14,3.94,44.71,44.71,0,0,0,5.17,17A30.7,30.7,0,0,0,77.7,48,46.67,46.67,0,0,0,91.18,51.6a10.07,10.07,0,0,1,5,1.61A8,8,0,0,1,99.47,59.46Z" style="fill:#724b3b;"></path></g>
							<g><path d="M150.55,64.51c0-2.85,2-4.81,5.21-5.17a70.14,70.14,0,0,0,22.66-6.16c11.76-5.63,19.74-14.69,24.38-26.79a73.74,73.74,0,0,0,4.1-16.62c.12-.88.22-1.77.35-2.65a5.09,5.09,0,0,1,5.15-4.29,5.15,5.15,0,0,1,4.95,4.6c1,8.48,2.9,16.7,6.8,24.36A47,47,0,0,0,248.8,54.38,71.18,71.18,0,0,0,266,59c1.22.18,2.44.32,3.66.49a5.08,5.08,0,0,1-.16,10.08,76,76,0,0,0-20.57,5c-13.6,5.62-22.7,15.48-27.64,29.27a75.34,75.34,0,0,0-3.72,15.87c-.11.87-.18,1.74-.37,2.58a5,5,0,0,1-5,3.88,5,5,0,0,1-4.91-4.25,104.4,104.4,0,0,0-2-11.52A56.07,56.07,0,0,0,195.88,90a47.76,47.76,0,0,0-21.34-15.82,73.12,73.12,0,0,0-16.8-4.22c-1.11-.15-2.24-.24-3.33-.49A5,5,0,0,1,150.55,64.51Z" style="fill:#fefefe;"></path></g>
							<g><path d="M96.66,59.64c0,2.72-2,4.75-5,5.07a48,48,0,0,0-18.79,5.73c-7.7,4.42-12.66,11.06-15.51,19.37a54.41,54.41,0,0,0-2.58,11.84,5.17,5.17,0,0,1-4.61,4.82,5,5,0,0,1-5.37-3.66c-.32-1.22-.39-2.51-.59-3.76C43.12,91.79,40.89,85,36.37,79A34.75,34.75,0,0,0,19.44,67.26,55.2,55.2,0,0,0,7.59,64.69,5.1,5.1,0,0,1,7.51,54.5a49.73,49.73,0,0,0,18.26-5.35C33.78,44.79,39,38.09,42,29.57A55.45,55.45,0,0,0,44.64,17.3a5.1,5.1,0,0,1,4.93-4.61,5,5,0,0,1,5.15,4.25,70.57,70.57,0,0,0,2.05,10.4A36.58,36.58,0,0,0,66.4,43.85a37,37,0,0,0,15.32,8.61A57.21,57.21,0,0,0,92,54.5,5.1,5.1,0,0,1,96.66,59.64Z" style="fill:#fefefe;"></path></g>
							<g><path d="M212.35,8.67c1.09,8.94,3.22,17.58,7.36,25.65,6.19,12.07,15.8,20.34,28.37,25.27a78.29,78.29,0,0,0,18.52,4.62l1.7.23c.07,0,.12,0,.29.09-2.64.32-5.16.69-7.66,1.19a66.52,66.52,0,0,0-22.37,8.42,51.63,51.63,0,0,0-20.32,23.6A74,74,0,0,0,213,115.82c-.25,1.51-.44,3-.66,4.53-.33,0-.07-.37-.22-.5-1.18-9.36-3.52-18.38-8.12-26.71-6.23-11.3-15.57-19-27.51-23.71A77.44,77.44,0,0,0,159.05,65c-1-.15-2-.28-3.2-.44,1.44-.21,2.72-.37,4-.57,10.06-1.57,19.6-4.58,28.11-10.36a52.12,52.12,0,0,0,19.33-24.65A78.23,78.23,0,0,0,212,10.05c0-.29.09-.58.13-.88C212.28,9,212,8.73,212.35,8.67Z" style="fill:#fea700;"></path></g>
							<g><path d="M212.35,8.67l-.22.5c0-.16,0-.32,0-.48a.94.94,0,0,1,.2-.43Z" style="fill:#febf45;"></path></g>
							<g><path d="M212.13,119.85l.22.5a.54.54,0,0,1,0,.43A1.67,1.67,0,0,1,212.13,119.85Z" style="fill:#fec14b;"></path></g>
							<g><path d="M49.85,18.74c1.17,9.35,3.89,18.1,9.94,25.54a39.53,39.53,0,0,0,18,12.26A65.83,65.83,0,0,0,91.14,59.6c-1.14.17-2.28.33-3.41.52A49.39,49.39,0,0,0,68,67.47,38.72,38.72,0,0,0,53.06,86.79a60.33,60.33,0,0,0-3.21,13.45c-.14.08.11.4-.22.37a54.74,54.74,0,0,0-5.82-19.5C39,72.18,31.63,66.25,22.16,62.8A59.36,59.36,0,0,0,8.94,59.72c-.13,0-.25,0-.38-.06l-.35-.12A62.83,62.83,0,0,0,20.9,56.81a40.52,40.52,0,0,0,17.15-10.7,41.81,41.81,0,0,0,9.38-16.86,59.39,59.39,0,0,0,2.2-10.89C50,18.34,49.7,18.66,49.85,18.74Z" style="fill:#fea700;"></path></g>
							<g><path d="M49.85,18.74l-.22-.38v-.48A1.07,1.07,0,0,1,49.85,18.74Z" style="fill:#fed890;"></path></g>
							<g><path d="M49.63,100.61l.22-.37a1.27,1.27,0,0,1-.14.78C49.56,100.9,49.63,100.75,49.63,100.61Z" style="fill:#febf46;"></path></g>
						</g>
					</g>
				</svg>
			</section>
		</section>
	</section>
</section>
<section style="display: flex; flex-direction: row; align-items: flex-start; margin: 10px 0;">
  <!-- Icon Section -->
  <section style="display: inline-block;vertical-align: top;width: 60px;align-self: flex-start;flex: 0 0 auto;height: auto;box-shadow: rgba(255, 255, 255, 0) 0px 0px 0px;z-index: 1;box-sizing:border-box;">
    <section>
      <section style="line-height: 0;">
        <section style="vertical-align: middle;display: inline-block;line-height: 0;border-width: 0px;border-radius: 0%;border-style: none;border-color: #3e3e3e;box-shadow: #000000 0px 0px 0px;box-sizing:border-box;">
          <img src="${iconUrl}" class="rich_pages wxw-img" style="vertical-align: middle;width: 100%;box-sizing:border-box;max-width:100% !important;" width="100%" data-aistatus="1" draggable="false" />
        </section>
      </section>
    </section>
  </section>
  <!-- Content Section -->
  <section style="margin-top: 20px;margin-right: 30px;margin-left: -30px;padding: 10px 20px;display: inline-block;vertical-align: top;width: auto;align-self: flex-start;flex: 1 1 0%;box-shadow: rgba(255, 255, 255, 0) 0px 0px 0px;height: auto;background-color: #fffaf2;border-style: solid;border-width: 2px;border-radius: 20px;border-color: var(--md-primary-color, #4154b5);overflow: hidden;box-sizing:border-box;">
    <section>
      <section style="text-align: center;">
        <section style="text-align: justify;">
          ${text}
        </section>
      </section>
    </section>
  </section>
</section>\n`;
          }

          if (type === 'topwar-head') {
            let iconUrl = 'https://mmbiz.qpic.cn/mmbiz_png/XkZ04otWBIYFqt5kVv7XRBPzM2MqyhOv7yALxnvrIROoibC7Vwesw82D1QcGOibialpGKTmdHNNpUHHqDZtPR4YdoLMk3ic2g35pdL91w0w3Dv4/640?wx_fmt=png&from=appmsg';
            const rawTitle = token.containerTitle || '';
            const contentInsideBraces = rawTitle.match(/^\{(.*)\}$/)?.[1] || rawTitle;
            const markdownImgMatch = contentInsideBraces.match(/!\[.*?\]\((.*?)\)/);
            
            if (markdownImgMatch) {
              iconUrl = markdownImgMatch[1];
            } else if (contentInsideBraces.trim()) {
              iconUrl = contentInsideBraces.trim();
            }

            return `
<section style="text-align:center;margin: 0px 0px 0em;padding: 0px;max-width: 100%;clear: both;min-height: 1em;box-sizing: border-box !important;overflow-wrap: break-word !important;">
	<img src="https://mmbiz.qpic.cn/mmbiz_jpg/1Fv7Rib30SzMIbusM8icT92siaS2MRAKgRjqEbCcXt4mw4y9ZsiaibLomAQLLSH6rGDZYTTTADIre11cQxo7jxyWibFw/640?wx_fmt=jpeg" class="rich_pages wxw-img" data-s="300,640" data-type="jpeg" style="margin: 0px;padding: 0px;vertical-align: bottom;letter-spacing: 0.544px;outline: 0px;height: auto !important;overflow-wrap: break-word !important;width: 100%;visibility: visible !important;box-sizing:border-box;max-width:100% !important;" data-imgfileid="100072670" data-aistatus="1" data-ratio="0.15648148148148147" data-w="1080"/>
</section>
<section data-role="paragraph" style="text-decoration: none;margin: 0px;padding: 0px;max-width: 100%;color: rgba(0, 0, 0, 0.9);text-align: justify;font-size: 12px;letter-spacing: 0.578px;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family:mp-quote, -apple-system-font, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif;">
	<section data-role="paragraph" style="letter-spacing: 0.578px;">
		<section data-role="paragraph">
			<section style="text-align:center;padding: 0px 0.5em;box-sizing:border-box;">
				<img src="${iconUrl}" class="rich_pages wxw-img" data-s="300,640" data-type="png" style="vertical-align: baseline;border-radius: 9px;width: 100%;height: 239px;box-shadow: #969696 0em 0em 0.5em 0px;font-size: 17px;box-sizing:border-box;max-width:100% !important;" data-aistatus="1" data-ratio="0.42592592592592593" data-w="1080"/>
			</section>
		</section>
	</section>
</section>\n`;
          }

          if (type === 'topwar-review') {
            console.log('[DEBUG] topwar-review text:', text);
            // Clean up the text to remove unnecessary p/br/empty tags that might interfere with matching
            const cleanedText = text.replace(/<p>|<\/p>|<br\/?>/g, '').trim();
            
            const items = [];
            const itemRegex = /(?:<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>\s*)?(<figure[\s\S]*?<\/figure>)(?:\s*<\/a>)?/gi;
            let match;
            while ((match = itemRegex.exec(cleanedText)) !== null) {
              const outerHref = match[1] || '';
              const fig = match[2];
              
              const hrefMatch = fig.match(/\bhref=["']([^"']+)["']/i);
              const href = outerHref || (hrefMatch ? hrefMatch[1] : '');
              
              const imgUrlMatch = fig.match(/\bimgurl=["']([^"']+)["']/i);
              const srcMatch = fig.match(/\bsrc=["']([^"']+)["']/i);
              const captionMatch = fig.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
              
              items.push({
                href,
                img: (imgUrlMatch ? imgUrlMatch[1] : (srcMatch ? srcMatch[1] : '')),
                caption: captionMatch ? captionMatch[1] : ''
              });
            }

            if (items.length === 2 || items.length === 4) {
              let rowsHtml = '';
              
              for (let i = 0; i < items.length; i += 2) {
                const item1 = items[i];
                const item2 = items[i + 1];
                
                const generateColumn = (item: { href: string; img: string; caption: string }) => `
	<section style="margin: 0px;padding: 0px;max-width: 100%;outline: 0px;display: inline-block;vertical-align: top;width: 49.1525%;flex: 0 0 auto;height: auto;align-self: flex-start;overflow-wrap: break-word !important;box-sizing:border-box;">
		<section style="margin: 0.5em 0px 2px 0px;padding: 0px 0.5em;max-width: 100%;color: #222222;outline: 0px;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;">
			<section style="margin: 0px;padding: 0px;max-width: 100%;outline: 0px;box-shadow: #666666 3px 3px 7px;display: inline-block;line-height: 0;border-color: white;overflow-wrap: break-word !important;height: auto !important;box-sizing:border-box;">
				<a href="${item.href}" imgurl="${item.img}" linktype="image" tab="innerlink" data-itemshowtype="0" target="_blank" data-linktype="1"><span style="margin:0px;padding:0px;max-width:100%;font-size:0px;display:inline-block;overflow:hidden;outline:0px;line-height:0;vertical-align:bottom;box-sizing:border-box !important;overflow-wrap:break-word !important;" class="js_jump_icon h5_image_link"><img src="${item.img}" class="rich_pages wxw-img" data-s="300,640" data-type="png" style="margin: 0px;padding: 0px;vertical-align: top;outline: 0px;border-width: 0px;border-style: initial;border-color: initial;display: block;width: 100%;max-width: 100%;overflow-wrap: break-word !important;visibility: visible !important;box-sizing:border-box;" data-aistatus="1" data-ratio="0.42592592592592593" data-w="1080"/></span></a>
			</section>
		</section>
		<section style="margin: 0px 0px 10px 0px;padding: 0px 5px;max-width: 100%;outline: 0px;font-size: 13px;text-align: center;box-sizing: border-box !important;overflow-wrap: break-word !important;">
			<p style="margin: 0px;padding: 0px;max-width: 100%;clear: both;min-height: 1em;outline: 0px;box-sizing: border-box !important;overflow-wrap: break-word !important;">
				<span style="margin: 0px;padding: 0px;max-width: 100%;color: #3e3e3e;box-sizing: border-box !important;overflow-wrap: break-word !important;"><span>${item.caption}</span></span>
			</p>
		</section>
	</section>`;

                rowsHtml += `
<section style="margin: 0px;padding: 0px;max-width: 100%;outline: 0px;font-size: 17px;text-align: left;justify-content: flex-start;display: flex;flex-flow: row;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  ${generateColumn(item1)}
	<section style="margin: 0px;padding: 0px;max-width: 100%;color: #222222;outline: 0px;display: inline-block;vertical-align: top;width: 1.69492%;flex: 0 0 auto;height: auto;align-self: flex-start;overflow-wrap: break-word !important;box-sizing:border-box;">
		<svg viewBox="0 0 1 1" style="float: left;line-height: 0;width: 0px;vertical-align: top;box-sizing:border-box;" xml:space="default"></svg>
	</section>
  ${generateColumn(item2)}
</section>`;
              }
              return rowsHtml + '\n';
            }

            return `
<section class="topwar-review">
  ${text}
</section>\n`;
          }

          if (type === 'topwar-end') {
            return `
<section style="margin: 0px;padding: 0px;max-width: 100%;clear: both;min-height: 1em;color: #222222;outline: 0px;box-sizing: border-box !important;overflow-wrap: break-word !important;">
	<img src="https://mmbiz.qpic.cn/mmbiz_gif/1Fv7Rib30SzMIbusM8icT92siaS2MRAKgRjZw74Xib8SNppXh0fg84J4qr4vibUia5PoGFj4qstvCVSBUibTUvmO34IIA/640?wx_fmt=gif" class="rich_pages wxw-img __bg_gif" data-type="gif" style="margin: 0px;padding: 0px;vertical-align: bottom;outline: 0px;font-size: 17px;caret-color: red;text-align: center;width: 100%;letter-spacing: 0.54px;display: initial;height: auto !important;overflow-wrap: break-word !important;visibility: visible !important;box-sizing:border-box;max-width:100% !important;font-family:-apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, &quot;Microsoft YaHei&quot;, Arial, sans-serif;" data-imgfileid="100072696" data-aistatus="1" data-ratio="0.4" data-w="1000"/>
</section>
<section style="margin: 10px auto;padding: 0px;max-width: 100%;display: flex;justify-content: space-between;align-items: center;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <section style="margin: 0px;padding: 0px;max-width: 100%;width: 30px;overflow-wrap: break-word !important;box-sizing:border-box;">
    <img src="https://mmbiz.qpic.cn/mmbiz_gif/1Fv7Rib30SzPlWPXLaDawk1JUrhpicE8icmvtbgpck6SHUH7fG45DKOofRe9NbGJpITCAC7dQpWYhCdMFOib3WLbZw/640?wx_fmt=gif" class="rich_pages wxw-img" data-type="gif" style="margin: 0px;padding: 0px;vertical-align: baseline;width: 100%;display: block;height: auto !important;overflow-wrap: break-word !important;box-sizing:border-box;max-width:100% !important;" />
  </section>
  <section style="margin: 5px 0px 0px;padding: 0px;max-width: 100%;flex: 1 1 0%;box-sizing: border-box !important;overflow-wrap: break-word !important;text-align: center;">
    ${text}
  </section>
  <section style="margin: 0px;padding: 0px;max-width: 100%;width: 30px;overflow-wrap: break-word !important;box-sizing:border-box;transform: scaleX(-1);-webkit-transform: scaleX(-1);-moz-transform: scaleX(-1);-o-transform: scaleX(-1);">
    <img src="https://mmbiz.qpic.cn/mmbiz_gif/1Fv7Rib30SzPlWPXLaDawk1JUrhpicE8icmvtbgpck6SHUH7fG45DKOofRe9NbGJpITCAC7dQpWYhCdMFOib3WLbZw/640?wx_fmt=gif" class="rich_pages wxw-img" data-type="gif" style="margin: 0px;padding: 0px;vertical-align: baseline;width: 100%;display: block;height: auto !important;overflow-wrap: break-word !important;box-sizing:border-box;max-width:100% !important;" />
  </section>
</section>\n`;
          }

          return `<section class="${type}">${text}</section>\n`;
        }
      }
    ]
  };
}
