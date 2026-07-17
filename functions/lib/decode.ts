/**
 * lz-string の decompressFromEncodedURIComponent をインライン化したEdge対応版
 * MIT License - based on lz-string by pieroxy
 * https://github.com/pieroxy/lz-string
 */

const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
const baseReverseDic: Record<string, Record<string, number>> = {};

function getBaseValue(alphabet: string, character: string): number {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (let i = 0; i < alphabet.length; i++) {
      baseReverseDic[alphabet][alphabet[i]] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

function _decompress(length: number, resetValue: number, getNextValue: (index: number) => number): string {
  const dictionary: string[] = [];
  let next: number;
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = '';
  const result: string[] = [];
  let i: number;
  let w: string;
  let bits = 0;
  let maxpower = Math.pow(2, 2);
  let power = 1;
  let c: string;
  let data = { val: getNextValue(0), position: resetValue, index: 1 };

  for (i = 0; i < 3; i += 1) {
    dictionary[i] = String(i);
  }

  bits = 0;
  maxpower = Math.pow(2, 2);
  power = 1;
  while (power !== maxpower) {
    const resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = resetValue;
      data.val = getNextValue(data.index++);
    }
    bits |= (resb > 0 ? 1 : 0) * power;
    power <<= 1;
  }

  switch (next = bits) {
    case 0:
      bits = 0;
      maxpower = Math.pow(2, 8);
      power = 1;
      while (power !== maxpower) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 1:
      bits = 0;
      maxpower = Math.pow(2, 16);
      power = 1;
      while (power !== maxpower) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return '';
    default:
      return '';
  }

  dictionary[3] = c!;
  w = c!;
  result.push(c!);

  while (true) {
    if (data.index > length) {
      return '';
    }
    bits = 0;
    maxpower = Math.pow(2, numBits);
    power = 1;
    while (power !== maxpower) {
      const resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (c = String(bits)) {
      case '0':
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          const resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        c = String(dictSize - 1);
        enlargeIn--;
        break;
      case '1':
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          const resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        c = String(dictSize - 1);
        enlargeIn--;
        break;
      case '2':
        return result.join('');
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    if (dictionary[Number(c)]) {
      entry = dictionary[Number(c)];
    } else {
      if (c === String(dictSize)) {
        entry = w + w[0];
      } else {
        return '';
      }
    }
    result.push(entry);
    dictionary[dictSize++] = w + entry[0];
    enlargeIn--;

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    w = entry;
  }
}

export function decompressFromEncodedURIComponent(input: string): string {
  if (!input) return '';
  const sanitized = input.replace(/ /g, '+');
  return _decompress(sanitized.length, 32, (index) =>
    getBaseValue(keyStrUriSafe, sanitized[index])
  );
}

export interface CardData {
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

export const FIELD_MAX_LENGTHS: Record<string, number> = {
  name: 50,
  nameEn: 50,
  title: 100,
  tagline: 150,
  company: 100,
  email: 100,
  phone: 30,
  sns: 150,
  website: 200,
};

export function decodeCardData(compressed: string | null): CardData {
  if (!compressed) return {};
  try {
    const json = decompressFromEncodedURIComponent(compressed);
    const data = JSON.parse(json);
    
    // 型安全性のチェック (null, 配列, オブジェクト以外を排除)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {};
    }

    const validatedData: CardData = {};
    const keys: (keyof CardData)[] = [
      'name', 'nameEn', 'title', 'tagline', 'company', 
      'email', 'phone', 'sns', 'website', 'layout'
    ];

    for (const key of keys) {
      if (key in data && data[key] !== undefined && data[key] !== null) {
        if (key === 'layout') {
          // レイアウト値の安全確認
          const layoutVal = String(data[key]);
          if (['standard', 'professional', 'minimal'].includes(layoutVal)) {
            validatedData.layout = layoutVal;
          }
        } else {
          // 各文字列フィールドの切り詰め
          const rawVal = String(data[key]);
          const maxLen = FIELD_MAX_LENGTHS[key] || 100;
          validatedData[key] = rawVal.substring(0, maxLen);
        }
      }
    }

    return validatedData;
  } catch {
    return {};
  }
}
