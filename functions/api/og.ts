/**
 * /api/og - Dynamic OGP image generation endpoint
 * Generates a 1200x630 PNG business card image
 * Stack: satori/wasm + yoga-wasm-web + @resvg/resvg-wasm
 *
 * Query params:
 *   name     - 名前 (Japanese)
 *   nameEn   - 名前 (English)
 *   title    - 肩書き
 *   company  - 会社名
 */

// Cloudflare Pages Functions ランタイム向け: satori/standalone エントリーポイント使用
// @ts-ignore
import initYoga from 'yoga-wasm-web';
// @ts-ignore
import { initWasm as initResvg, Resvg } from '@resvg/resvg-wasm';
// @ts-ignore
import satori, { init as initSatori } from 'satori/standalone';

// WASM バイナリの URL（CDN経由でフェッチ）
const YOGA_WASM_URL  = 'https://cdn.jsdelivr.net/npm/yoga-wasm-web@0.3.3/dist/yoga.wasm';
const RESVG_WASM_URL = 'https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm';

// フォント URL（Google Fonts CDN）
const NOTO_SANS_JP_URL = 'https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEi75g.woff2';
const NOTO_SANS_URL    = 'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a7du3mhPy0.woff2';

// 初期化済みフラグ（isolate内で再利用）
let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  const [yogaWasmData, resvgWasmData] = await Promise.all([
    fetch(YOGA_WASM_URL).then(r => r.arrayBuffer()),
    fetch(RESVG_WASM_URL).then(r => r.arrayBuffer()),
  ]);
  const yoga = await initYoga(yogaWasmData);
  await initSatori(yoga);
  await initResvg(resvgWasmData);
  initialized = true;
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const name    = (url.searchParams.get('name')    ?? '').slice(0, 30);
  const nameEn  = (url.searchParams.get('nameEn')  ?? '').slice(0, 40);
  const title   = (url.searchParams.get('title')   ?? '').slice(0, 50);
  const company = (url.searchParams.get('company') ?? '').slice(0, 50);

  try {
    // WASM 初期化（初回のみ）
    await ensureInitialized();

    // フォントを並列取得
    const [jpFontData, enFontData] = await Promise.all([
      fetch(NOTO_SANS_JP_URL).then(r => r.arrayBuffer()),
      fetch(NOTO_SANS_URL).then(r => r.arrayBuffer()),
    ]);

    // Satori で SVG 生成
    const svg = await satori(
      buildCardElement(name, nameEn, title, company),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'NotoSansJP', data: jpFontData, weight: 400, style: 'normal' as const },
          { name: 'NotoSans',   data: enFontData, weight: 400, style: 'normal' as const },
        ],
      }
    );

    // SVG → PNG
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render().asPng();

    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });

  } catch (err) {
    console.error('[og] error:', err);
    return new Response(String(err), { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Card layout builder (returns a Satori-compatible virtual DOM object)
// ---------------------------------------------------------------------------

function buildCardElement(
  name: string,
  nameEn: string,
  title: string,
  company: string,
) {
  const hasName    = name.trim().length > 0;
  const hasNameEn  = nameEn.trim().length > 0;
  const hasTitle   = title.trim().length > 0;
  const hasCompany = company.trim().length > 0;

  // Determine display name and sub-name
  const displayName    = hasName   ? name    : (hasNameEn ? nameEn : 'Business Card Breakout');
  const displaySubName = hasName && hasNameEn ? nameEn : '';

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '80px 100px',
        fontFamily: "'NotoSansJP', 'NotoSans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Background decorative circle (top-right)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0) 70%)',
            },
            children: [],
          },
        },
        // Background decorative circle (bottom-left)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-100px',
              left: '-60px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.10) 0%, rgba(255,215,0,0) 70%)',
            },
            children: [],
          },
        },
        // Game icon label (top-left badge)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '48px',
              right: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'NotoSans', sans-serif",
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  },
                  children: ['Business Card Breakout'],
                },
              },
            ],
          },
        },
        // Accent line
        {
          type: 'div',
          props: {
            style: {
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #00D4FF, #FFD700)',
              borderRadius: '2px',
              marginBottom: '32px',
            },
            children: [],
          },
        },
        // Main name
        {
          type: 'div',
          props: {
            style: {
              fontSize: hasName ? '80px' : '64px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: '1.1',
              marginBottom: '8px',
              letterSpacing: hasName ? '2px' : '0px',
            },
            children: [displayName],
          },
        },
        // English sub-name
        ...(displaySubName ? [{
          type: 'div',
          props: {
            style: {
              fontSize: '36px',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: "'NotoSans', sans-serif",
              marginBottom: '28px',
              letterSpacing: '1px',
            },
            children: [displaySubName],
          },
        }] : [{ type: 'div', props: { style: { marginBottom: '28px' }, children: [] } }]),
        // Company + Title row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            },
            children: [
              // Company
              ...(hasCompany ? [{
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#FFD700',
                          flexShrink: 0,
                        },
                        children: [],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '32px',
                          color: '#FFD700',
                          fontFamily: "'NotoSansJP', 'NotoSans', sans-serif",
                          letterSpacing: '1px',
                        },
                        children: [company],
                      },
                    },
                  ],
                },
              }] : []),
              // Title
              ...(hasTitle ? [{
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#00D4FF',
                          flexShrink: 0,
                        },
                        children: [],
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '28px',
                          color: '#00D4FF',
                          fontFamily: "'NotoSansJP', 'NotoSans', sans-serif",
                          letterSpacing: '1px',
                        },
                        children: [title],
                      },
                    },
                  ],
                },
              }] : []),
              // No info fallback
              ...(!hasCompany && !hasTitle ? [{
                type: 'div',
                props: {
                  style: {
                    fontSize: '28px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'NotoSans', sans-serif",
                  },
                  children: ['Interactive Business Card Game'],
                },
              }] : []),
            ],
          },
        },
        // Bottom: pixel game motif
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '48px',
              left: '100px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            },
            children: [
              // Pixel blocks
              ...[...Array(8)].map((_, i) => ({
                type: 'div',
                props: {
                  style: {
                    width: '24px',
                    height: '12px',
                    borderRadius: '2px',
                    background: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#FFD700' : 'rgba(255,255,255,0.2)',
                    opacity: String(1 - i * 0.08),
                  },
                  children: [],
                },
              })),
            ],
          },
        },
      ],
    },
  };
}
