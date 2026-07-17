/**
 * /api/og - Dynamic OGP image generation endpoint
 * Generates a 1200x630 PNG business card image replicating the retro game screen
 */

import React from 'react';
import { ImageResponse, CustomFont, cache } from '@cf-wasm/og/workerd';
import { decodeCardData } from '../lib/decode';

// Font URL — DotGothic16 (Retro Japanese Pixel Font) from Google Fonts CDN
const DOT_GOTHIC_16_URL =
  'https://fonts.gstatic.com/s/dotgothic16/v21/v6-QGYjBJFKgyw5nSoDAGE7L.ttf';

interface CardProps {
  name?: string;
  nameEn?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  sns?: string;
  website?: string;
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
      name: url.searchParams.get('name') ?? '',
      nameEn: url.searchParams.get('nameEn') ?? '',
      title: url.searchParams.get('title') ?? '',
      company: url.searchParams.get('company') ?? '',
      email: url.searchParams.get('email') ?? '',
      phone: url.searchParams.get('phone') ?? '',
      sns: url.searchParams.get('sns') ?? '',
      website: url.searchParams.get('website') ?? '',
    };
  }

  try {
    const fonts = [
      new CustomFont('DotGothic16', () => fetch(DOT_GOTHIC_16_URL).then(r => r.arrayBuffer()), { weight: 400 }),
    ];

    // Return an ImageResponse replicating the breakout game board
    return await ImageResponse.async(
      <GameScreenLayout card={card} />,
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
// Card Layout Component (Replicating the actual Breakout Game Screen)
// ---------------------------------------------------------------------------

function GameScreenLayout({ card }: { card: CardProps }) {
  const name = card.name || card.nameEn || 'Business Card Breakout';
  
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        fontFamily: "'DotGothic16', monospace",
        position: 'relative',
        overflow: 'hidden',
        padding: '0',
      }}
    >
      {/* 1. Score Counter (Top-Left) */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50px',
          fontSize: '32px',
          color: '#ffffff',
          letterSpacing: '2px',
        }}
      >
        Score: 0
      </div>

      {/* 2. Yellow Ball (Game Ball) */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          left: '680px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: '#FFD607',
          boxShadow: '0 0 10px #FFD607',
        }}
      />

      {/* 3. Card Elements Container (Main Blocks) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          marginLeft: '150px',
          marginTop: '110px',
        }}
      >
        {/* Name */}
        <div
          style={{
            fontSize: '72px',
            color: '#FF6B8A',
            marginBottom: '20px',
            letterSpacing: '1px',
          }}
        >
          {name}
        </div>

        {/* Title */}
        {card.title && (
          <div
            style={{
              fontSize: '40px',
              color: '#A78BFA',
              marginBottom: '10px',
              letterSpacing: '1px',
            }}
          >
            {card.title}
          </div>
        )}

        {/* Company */}
        {card.company && (
          <div
            style={{
              fontSize: '46px',
              color: '#60A5FA',
              marginBottom: '24px',
              letterSpacing: '1px',
            }}
          >
            {card.company}
          </div>
        )}

        {/* Contacts */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {card.email && (
            <div style={{ fontSize: '28px', color: '#34D399', letterSpacing: '1px' }}>
              {card.email}
            </div>
          )}
          {card.phone && (
            <div style={{ fontSize: '28px', color: '#FB923C', letterSpacing: '1px' }}>
              {card.phone}
            </div>
          )}
          {card.sns && (
            <div style={{ fontSize: '28px', color: '#F472B6', letterSpacing: '1px' }}>
              {card.sns}
            </div>
          )}
          {card.website && (
            <div style={{ fontSize: '28px', color: '#FBBF24', letterSpacing: '1px' }}>
              {card.website}
            </div>
          )}
        </div>
      </div>

      {/* 4. White Game Paddle (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '25px',
          right: '30px',
          width: '450px',
          height: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}
