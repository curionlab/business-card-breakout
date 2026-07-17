/**
 * /api/og - Dynamic OGP image generation endpoint
 * Generates a 1200x630 PNG business card image using @cf-wasm/og (workerd runtime)
 *
 * Query params:
 *   name     - 名前 (Japanese)
 *   nameEn   - 名前 (English)
 *   title    - 肩書き
 *   company  - 会社名
 */

// @ts-ignore
import { ImageResponse, cache, GoogleFont } from '@cf-wasm/og/workerd';

// Font URLs — Noto Sans JP from Google Fonts
const JP_FONT  = new GoogleFont('Noto Sans JP', { weight: 400 });
const EN_FONT  = new GoogleFont('Noto Sans',    { weight: 400 });

export const onRequest: PagesFunction = async (context) => {
  // @cf-wasm/og のキャッシュに実行コンテキストを渡す（必須）
  // @ts-ignore
  cache.setExecutionContext(context);

  const url = new URL(context.request.url);
  const name    = (url.searchParams.get('name')    ?? '').slice(0, 30);
  const nameEn  = (url.searchParams.get('nameEn')  ?? '').slice(0, 40);
  const title   = (url.searchParams.get('title')   ?? '').slice(0, 50);
  const company = (url.searchParams.get('company') ?? '').slice(0, 50);

  try {
    // @ts-ignore
    const response = await ImageResponse.async(
      buildCardElement(name, nameEn, title, company),
      {
        width: 1200,
        height: 630,
        fonts: [JP_FONT, EN_FONT],
      }
    );

    // キャッシュヘッダーを付与して返す
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return new Response(response.body, { status: response.status, headers });

  } catch (err) {
    console.error('[og] image generation error:', err);
    return new Response('Image generation failed', { status: 500 });
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
