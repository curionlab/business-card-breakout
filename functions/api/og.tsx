/**
 * /api/og - Dynamic OGP image generation endpoint
 * Generates a 1200x630 PNG business card image using @cf-wasm/og/workerd
 */

import React from 'react';
import { ImageResponse, CustomFont, cache } from '@cf-wasm/og/workerd';
import { decodeCardData } from '../lib/decode';

// Font URLs — Noto Sans JP (regular) from Google Fonts CDN
const NOTO_SANS_JP_URL =
  'https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf';
const NOTO_SANS_URL_400 =
  'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf';
const NOTO_SANS_URL_700 =
  'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAaBN9d.ttf';

export const onRequest: PagesFunction = async (context) => {
  // Required by @cf-wasm/og
  cache.setExecutionContext(context);

  const url = new URL(context.request.url);
  const compressed = url.searchParams.get('d');

  let name = '';
  let nameEn = '';
  let title = '';
  let company = '';

  if (compressed) {
    const card = decodeCardData(compressed);
    name = card.name ?? '';
    nameEn = card.nameEn ?? '';
    title = card.title ?? '';
    company = card.company ?? '';
  } else {
    name    = (url.searchParams.get('name')    ?? '').slice(0, 30);
    nameEn  = (url.searchParams.get('nameEn')  ?? '').slice(0, 40);
    title   = (url.searchParams.get('title')   ?? '').slice(0, 50);
    company = (url.searchParams.get('company') ?? '').slice(0, 50);
  }

  try {
    const fonts = [
      new CustomFont('NotoSansJP', () => fetch(NOTO_SANS_JP_URL).then(r => r.arrayBuffer()), { weight: 400 }),
      new CustomFont('NotoSans', () => fetch(NOTO_SANS_URL_400).then(r => r.arrayBuffer()), { weight: 400 }),
      new CustomFont('NotoSans', () => fetch(NOTO_SANS_URL_700).then(r => r.arrayBuffer()), { weight: 700 }),
    ];

    // Return an ImageResponse using cf-wasm/og
    return await ImageResponse.async(
      <CardLayout name={name} nameEn={nameEn} title={title} company={company} />,
      {
        width: 1200,
        height: 630,
        fonts: fonts,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        }
      }
    );

  } catch (err) {
    console.error('[og] image generation error:', err);
    return new Response(String(err), { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Card Layout Component
// ---------------------------------------------------------------------------

function CardLayout({ name, nameEn, title, company }: { name: string, nameEn: string, title: string, company: string }) {
  const hasName    = name.trim().length > 0;
  const hasNameEn  = nameEn.trim().length > 0;
  const hasTitle   = title.trim().length > 0;
  const hasCompany = company.trim().length > 0;

  const displayName    = hasName   ? name    : (hasNameEn ? nameEn : 'Business Card Breakout');
  const displaySubName = hasName && hasNameEn ? nameEn : '';

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-80px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-60px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.10) 0%, rgba(255,215,0,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '48px',
          right: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'NotoSans', sans-serif",
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Business Card Breakout
        </span>
      </div>
      <div
        style={{
          width: '80px',
          height: '4px',
          background: 'linear-gradient(90deg, #00D4FF, #FFD700)',
          borderRadius: '2px',
          marginBottom: '32px',
          display: 'flex',
        }}
      />
      <div
        style={{
          fontSize: hasName ? '80px' : '64px',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: '1.1',
          marginBottom: '8px',
          letterSpacing: hasName ? '2px' : '0px',
          display: 'flex',
        }}
      >
        {displayName}
      </div>
      {displaySubName ? (
        <div
          style={{
            fontSize: '36px',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: "'NotoSans', sans-serif",
            marginBottom: '28px',
            letterSpacing: '1px',
            display: 'flex',
          }}
        >
          {displaySubName}
        </div>
      ) : (
        <div style={{ marginBottom: '28px', display: 'flex' }} />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {hasCompany && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FFD700',
                flexShrink: 0,
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: '32px',
                color: '#FFD700',
                fontFamily: "'NotoSansJP', 'NotoSans', sans-serif",
                letterSpacing: '1px',
              }}
            >
              {company}
            </span>
          </div>
        )}
        
        {hasTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00D4FF',
                flexShrink: 0,
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: '28px',
                color: '#00D4FF',
                fontFamily: "'NotoSansJP', 'NotoSans', sans-serif",
                letterSpacing: '1px',
              }}
            >
              {title}
            </span>
          </div>
        )}

        {!hasCompany && !hasTitle && (
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'NotoSans', sans-serif",
              display: 'flex',
            }}
          >
            Interactive Business Card Game
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '100px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '24px',
              height: '12px',
              borderRadius: '2px',
              background: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#FFD700' : 'rgba(255,255,255,0.2)',
              opacity: String(1 - i * 0.08),
              display: 'flex',
            }}
          />
        ))}
      </div>
    </div>
  );
}
