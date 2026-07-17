/**
 * /api/og - Dynamic OGP image generation endpoint
 * Generates a 1200x630 PNG business card image replicating the retro game screen.
 * Supports three layouts: standard | professional | minimal
 */

import React from 'react';
import { ImageResponse, CustomFont, cache } from '@cf-wasm/og/workerd';
import { decodeCardData } from '../lib/decode';

// Font URL — DotGothic16 (Retro Japanese Pixel Font) from Google Fonts CDN
const DOT_GOTHIC_16_URL =
  'https://fonts.gstatic.com/s/dotgothic16/v21/v6-QGYjBJFKgyw5nSoDAGE7L.ttf';

// Element colors — kept in sync with src/config.ts ELEMENT_COLORS
const COLORS = {
  company: '#60A5FA',
  tagline: '#C084FC',
  name:    '#F16584',
  nameEn:  '#34D399',
  title:   '#A78BFA',
  email:   '#4ECDC4',
  phone:   '#FB923C',
  sns:     '#EC4899',
  website: '#FBBF24',
  muted:   'rgba(255,255,255,0.45)',
};

type CardLayout = 'standard' | 'professional' | 'minimal';

interface CardProps {
  name?: string;
  nameEn?: string;
  title?: string;
  tagline?: string;
  company?: string;
  email?: string;
  phone?: string;
  sns?: string;
  website?: string;
  layout?: string;
}

export const onRequest: PagesFunction = async (context) => {
  // Required by @cf-wasm/og
  cache.setExecutionContext(context);

  const url = new URL(context.request.url);
  const compressed = url.searchParams.get('d');

  let card: CardProps = {};

  if (compressed) {
    card = decodeCardData(compressed);
  } else {
    card = {
      name:    url.searchParams.get('name')    ?? '',
      nameEn:  url.searchParams.get('nameEn')  ?? '',
      title:   url.searchParams.get('title')   ?? '',
      tagline: url.searchParams.get('tagline') ?? '',
      company: url.searchParams.get('company') ?? '',
      email:   url.searchParams.get('email')   ?? '',
      phone:   url.searchParams.get('phone')   ?? '',
      sns:     url.searchParams.get('sns')     ?? '',
      website: url.searchParams.get('website') ?? '',
      layout:  url.searchParams.get('layout')  ?? 'standard',
    };
  }

  const layout: CardLayout =
    card.layout === 'professional' || card.layout === 'minimal'
      ? card.layout
      : 'standard';

  try {
    const fonts = [
      new CustomFont('DotGothic16', () => fetch(DOT_GOTHIC_16_URL).then(r => r.arrayBuffer()), { weight: 400 }),
    ];

    return await ImageResponse.async(
      <GameScreenLayout card={card} layout={layout} />,
      {
        width: 1200,
        height: 630,
        fonts,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    );

  } catch (err) {
    console.error('[og] image generation error:', err);
    return new Response(String(err), { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Outer Shell — background + HUD chrome (shared across layouts)
// ---------------------------------------------------------------------------

function GameScreenLayout({ card, layout }: { card: CardProps; layout: CardLayout }) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        fontFamily: "'DotGothic16', monospace",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Score HUD */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '48px',
          fontSize: '28px',
          color: '#ffffff',
          letterSpacing: '2px',
          opacity: 0.85,
        }}
      >
        Score: 0
      </div>

      {/* Yellow Ball */}
      <div
        style={{
          position: 'absolute',
          top: '66px',
          left: '700px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#FFD607',
          boxShadow: '0 0 10px #FFD607',
        }}
      />

      {/* Paddle */}
      <div
        style={{
          position: 'absolute',
          bottom: '22px',
          right: '28px',
          width: '420px',
          height: '9px',
          backgroundColor: '#cccccc',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(255,255,255,0.3)',
        }}
      />

      {/* Card content — layout-specific */}
      <CardContent card={card} layout={layout} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card Content — dispatches to layout-specific component
// ---------------------------------------------------------------------------

function CardContent({ card, layout }: { card: CardProps; layout: CardLayout }) {
  if (layout === 'professional') return <ProfessionalLayout card={card} />;
  if (layout === 'minimal')      return <MinimalLayout card={card} />;
  return <StandardLayout card={card} />;
}

// ---------------------------------------------------------------------------
// Shared helper — contact row
// ---------------------------------------------------------------------------

function ContactRow({ value, color }: { value: string; color: string }) {
  return (
    <div style={{ fontSize: '26px', color, letterSpacing: '0.5px', display: 'flex' }}>
      {value}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standard Layout
//   Name (large, left) → Title → Company → contacts
//   mirrors createStandardLayout() in BlockManager.ts
// ---------------------------------------------------------------------------

function StandardLayout({ card }: { card: CardProps }) {
  const displayName = card.name || card.nameEn || 'Business Card Breakout';

  return (
    <div
      style={{
        position: 'absolute',
        top: '108px',
        left: '150px',
        right: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0px',
      }}
    >
      {/* Name */}
      <div style={{ fontSize: '72px', color: COLORS.name, letterSpacing: '1px', lineHeight: 1.3, display: 'flex' }}>
        {displayName}
      </div>

      {/* Title */}
      {card.title && (
        <div style={{ fontSize: '38px', color: COLORS.title, letterSpacing: '1px', marginTop: '6px', display: 'flex' }}>
          {card.title}
        </div>
      )}

      {/* Company */}
      {card.company && (
        <div style={{ fontSize: '44px', color: COLORS.company, letterSpacing: '1px', marginTop: '8px', display: 'flex' }}>
          {card.company}
        </div>
      )}

      {/* Contacts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '18px' }}>
        {card.email   && <ContactRow value={card.email}   color={COLORS.email}   />}
        {card.phone   && <ContactRow value={card.phone}   color={COLORS.phone}   />}
        {card.sns     && <ContactRow value={card.sns}     color={COLORS.sns}     />}
        {card.website && <ContactRow value={card.website} color={COLORS.website} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Professional Layout
//   Company (center, top) → tagline (center) → Name (left, large) →
//   nameEn (left) → [gap] → Title (left) → labeled contacts
//   mirrors createProfessionalLayout() in BlockManager.ts
// ---------------------------------------------------------------------------

function ProfessionalLayout({ card }: { card: CardProps }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '68px',
        left: '0px',
        right: '0px',
        bottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 80px',
      }}
    >
      {/* Company — centered */}
      {card.company && (
        <div
          style={{
            fontSize: '58px',
            color: COLORS.company,
            letterSpacing: '1px',
            textAlign: 'center',
            display: 'flex',
            marginBottom: '4px',
          }}
        >
          {card.company}
        </div>
      )}

      {/* Tagline — centered */}
      {card.tagline && (
        <div
          style={{
            fontSize: '26px',
            color: COLORS.tagline,
            letterSpacing: '0.5px',
            textAlign: 'center',
            display: 'flex',
            marginBottom: '10px',
          }}
        >
          {card.tagline}
        </div>
      )}

      {/* Name — left aligned inside centered container */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {card.name && (
          <div style={{ fontSize: '76px', color: COLORS.name, letterSpacing: '1px', lineHeight: 1.2, display: 'flex' }}>
            {card.name}
          </div>
        )}

        {/* nameEn */}
        {card.nameEn && (
          <div style={{ fontSize: '32px', color: COLORS.nameEn, letterSpacing: '0.5px', marginTop: '4px', display: 'flex' }}>
            {card.nameEn}
          </div>
        )}

        {/* Title — after a gap */}
        {card.title && (
          <div style={{ fontSize: '32px', color: COLORS.title, letterSpacing: '0.5px', marginTop: '16px', display: 'flex' }}>
            {card.title}
          </div>
        )}

        {/* Labeled contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '14px', width: '100%' }}>
          {card.email   && <LabeledContactRow label="Email"   value={card.email}   color={COLORS.email}   />}
          {card.phone   && <LabeledContactRow label="Phone"   value={card.phone}   color={COLORS.phone}   />}
          {card.sns     && <LabeledContactRow label="SNS"     value={card.sns}     color={COLORS.sns}     />}
          {card.website && <LabeledContactRow label="Website" value={card.website} color={COLORS.website} />}
        </div>
      </div>
    </div>
  );
}

function LabeledContactRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '12px' }}>
      <div style={{ fontSize: '22px', color: COLORS.muted, width: '100px', display: 'flex' }}>{label}</div>
      <div style={{ fontSize: '24px', color, letterSpacing: '0.5px', display: 'flex' }}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Minimal Layout
//   Name (center, very large) → Title | Company (center) → contacts (center)
//   mirrors createMinimalLayout() in BlockManager.ts
// ---------------------------------------------------------------------------

function MinimalLayout({ card }: { card: CardProps }) {
  const displayName = card.name || card.nameEn || 'Business Card Breakout';
  const titleCompany = [card.title, card.company].filter(Boolean).join(' | ');

  return (
    <div
      style={{
        position: 'absolute',
        top: '90px',
        left: '0px',
        right: '0px',
        bottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 80px',
      }}
    >
      {/* Name — center, large */}
      <div
        style={{
          fontSize: '88px',
          color: COLORS.name,
          letterSpacing: '1px',
          lineHeight: 1.2,
          textAlign: 'center',
          display: 'flex',
          marginBottom: '8px',
        }}
      >
        {displayName}
      </div>

      {/* Title | Company — center */}
      {titleCompany && (
        <div
          style={{
            fontSize: '30px',
            color: COLORS.title,
            letterSpacing: '0.5px',
            textAlign: 'center',
            display: 'flex',
            marginBottom: '20px',
          }}
        >
          {titleCompany}
        </div>
      )}

      {/* Contacts — center */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        {card.email   && <ContactRow value={card.email}   color={COLORS.email}   />}
        {card.phone   && <ContactRow value={card.phone}   color={COLORS.phone}   />}
        {card.sns     && <ContactRow value={card.sns}     color={COLORS.sns}     />}
        {card.website && <ContactRow value={card.website} color={COLORS.website} />}
      </div>
    </div>
  );
}
