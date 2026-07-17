import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command, mode }) => {
  // 開発時は通常のアプリケーションモード
  if (command === 'serve') {
    return {
      root: 'examples',
      server: {
        host: true,
        port: 5173,
        open: true
      }
    };
  }

  // デモページのビルド
  if (mode === 'demo') {
    return {
      root: 'examples',
      base: '/',  // Cloudflare Pages + breakout.curionlab.com はルートで配信
      build: {
        outDir: '../dist-demo',
        emptyOutDir: true
      }
    };
  }

  // ビルド時はライブラリモード
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'BusinessCardBreakout',
        formats: ['es', 'umd'],  // ESM と UMD の両方をビルド
        fileName: (format) => `index.${format}.js`
      },
      rollupOptions: {
        output: {
          globals: {}
        }
      },
      // 本番ビルド時の最適化設定
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,        // console.* を削除
          drop_debugger: true,       // debugger を削除
          pure_funcs: ['console.log'] // console.log のみを削除（他のconsoleは残す）
        }
      }
    },
    plugins: [  
      dts({
        insertTypesEntry: true,
        outDir: 'dist'
      })
    ]
  };
});
