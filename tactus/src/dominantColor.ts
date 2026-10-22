import { getColorSync } from 'colorthief';
import * as htmlToImage from 'html-to-image';

export type RGB = [number, number, number];

/**
 * extracts the dominant RGB color from any CSS background string.
 */
export default async function extractDominantColorFromComplexGradient(cssGradient: string): Promise<RGB> {
  const sandbox = document.createElement('div');
  sandbox.style.width = '100px';
  sandbox.style.height = '100px';
  sandbox.style.position = 'absolute';
  sandbox.style.top = '-9999px';
  sandbox.style.left = '-9999px';
  sandbox.style.background = cssGradient;
  
  document.body.appendChild(sandbox);

  try {
    const canvas = await htmlToImage.toCanvas(sandbox, {
      width: 100,
      height: 100
    });

    document.body.removeChild(sandbox);

    const dominantColor = getColorSync(canvas);

    if (dominantColor && typeof dominantColor.rgb === 'function') {
      const rgbStr = dominantColor.css(); // e.g. "rgb(232, 67, 147)"
      const matches = rgbStr.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return [Number(matches[0]), Number(matches[1]), Number(matches[2])];
      }
    }

    return (dominantColor as unknown as RGB) || [100, 100, 100];
  } catch (error) {
    console.error("Failed to render background gradient snapshot:", error);
    if (sandbox.parentNode) {
      document.body.removeChild(sandbox);
    }
    return [100, 100, 100]; 
  }
}