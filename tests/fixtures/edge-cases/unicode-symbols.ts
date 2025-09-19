// Testing Unicode and emoji handling
export const 日本語変数 = 'Japanese variable';
export const émoji = '🎉';
export const математика = 42;

// Multi-byte characters in strings
const greeting = 'Hello 世界!';

// Unicode in function names
export function 计算总和(a: number, b: number): number {
  return a + b;
}

// Combining characters
const combined = 'é'; // e + combining accent
const precomposed = 'é'; // precomposed character

// Right-to-left text
const arabic = 'مرحبا بالعالم';

// Mathematical symbols
const π = Math.PI;
const Σ = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

// Simple emoji
export const emoji = {
  simple: '😀',
  flag: '🇯🇵',
};

// Class with Unicode name
export class 文档处理器 {
  处理(文本: string): string {
    return 文本.toUpperCase();
  }
}

// Interface with mixed scripts
interface МультиязычныйИнтерфейс {
  название: string;
  描述: string;
  القيمة: number;
}

// Simple emoji validation
function validateEmoji(input: string): boolean {
  return /[\u{1F300}-\u{1F9FF}]/gu.test(input);
}
