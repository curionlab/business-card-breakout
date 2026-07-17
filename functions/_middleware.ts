/**
 * Cloudflare Pages Middleware — OGP Bot Detection
 *
 * - SNSクローラーのUser-Agentを検出
 * - URLの ?d= パラメータをデコードして名刺情報を復元
 * - 動的OGPメタタグを含む軽量HTMLを返却
 * - 通常ユーザーはSPAをそのまま配信
 */

import { decodeCardData } from './lib/decode';

/** SNSクローラーの User-Agent パターン */
const BOT_UA_PATTERN =
  /Twitterbot|facebookexternalhit|Slackbot-LinkExpanding|Slackbot|LinkedInBot|TelegramBot|Discordbot|LINE|WhatsApp|Googlebot-Image|vkShare|W3C_Validator|Applebot/i;

const SITE_URL = 'https://breakout.curionlab.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og`;
const DEFAULT_TITLE = 'Business Card Breakout';
const DEFAULT_DESCRIPTION = '名刺をブロック崩しゲームに！ SNSでシェアすると名刺画像が表示されます。';

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  // APIパスへのリクエストはミドルウェアでインターセプトせずスルーする
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  const ua = request.headers.get('User-Agent') ?? '';

  // BotでなければそのままSPAを返す
  if (!BOT_UA_PATTERN.test(ua)) {
    return next();
  }

  const compressed = url.searchParams.get('d');

  // カードデータのデコード
  const card = decodeCardData(compressed);

  const hasCard = Boolean(compressed && (card.name || card.nameEn || card.company));

  // OGPタイトル・説明文の生成
  let ogTitle = DEFAULT_TITLE;
  let ogDescription = DEFAULT_DESCRIPTION;
  let ogImageUrl = DEFAULT_OG_IMAGE;

  if (hasCard) {
    const displayName = card.name || card.nameEn || '';
    const parts: string[] = [];
    if (displayName) parts.push(displayName);
    if (card.company) parts.push(card.company);
    if (card.title) parts.push(card.title);

    ogTitle = displayName
      ? `${displayName} - Business Card Breakout`
      : DEFAULT_TITLE;

    ogDescription = parts.length > 0
      ? `${parts.join(' | ')} のブロック崩し名刺を受け取りました！`
      : DEFAULT_DESCRIPTION;

    // 動的OGP画像URLに圧縮名刺情報をそのまま付与
    ogImageUrl = `${SITE_URL}/api/og?d=${compressed}`;
  }

  // HTMLエスケープ
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;')
     .replace(/"/g, '&quot;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;');

  const canonicalUrl = `${SITE_URL}/${url.search}`;

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(ogTitle)}</title>

  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${esc(canonicalUrl)}" />
  <meta property="og:title"       content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDescription)}" />
  <meta property="og:image"       content="${esc(ogImageUrl)}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name"   content="Business Card Breakout" />
  <meta property="og:locale"      content="ja_JP" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(ogDescription)}" />
  <meta name="twitter:image"       content="${esc(ogImageUrl)}" />

  <!-- Redirect bots to the actual SPA page -->
  <link rel="canonical" href="${esc(canonicalUrl)}" />
  <meta http-equiv="refresh" content="0;url=${esc(canonicalUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(canonicalUrl)}">${esc(ogTitle)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store', // Bot用レスポンスはキャッシュしない
    },
  });
};
