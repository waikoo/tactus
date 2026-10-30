import { getColorSync } from "colorthief";
import * as htmlToImage from "html-to-image";

export type RGB = [number, number, number];

export interface DominantColorOptions {
  useColorThief?: boolean;
}

const FALLBACK_COLOR: RGB = [128, 128, 128];

/**
 * Validates an RGB array.
 * Each channel must be an integer between 0 and 255.
 */
function validateRGB(value: unknown): RGB | null {
  if (!Array.isArray(value) || value.length < 3) {
    return null;
  }

  const channels = value.slice(0, 3);

  if (
    !channels.every(
      (channel: unknown) =>
        typeof channel === "number" &&
        Number.isInteger(channel) &&
        channel >= 0 &&
        channel <= 255,
    )
  ) {
    return null;
  }

  return [channels[0], channels[1], channels[2]];
}

/**
 * Extracts the dominant color from a canvas without ColorThief.
 * Pixels are bucketed into a coarse RGB histogram and the most
 * populated bucket is averaged to produce the final color.
 */
export function getDominantColorFromCanvas(canvas: HTMLCanvasElement): RGB {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [...FALLBACK_COLOR];
  }

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map<
    number,
    { count: number; r: number; g: number; b: number }
  >();

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  let dominant:
    | { count: number; r: number; g: number; b: number }
    | undefined;

  for (const bucket of buckets.values()) {
    if (!dominant || bucket.count > dominant.count) {
      dominant = bucket;
    }
  }

  if (!dominant) {
    return [...FALLBACK_COLOR];
  }

  return [
    Math.round(dominant.r / dominant.count),
    Math.round(dominant.g / dominant.count),
    Math.round(dominant.b / dominant.count),
  ];
}

/**
 * Extracts the dominant RGB color from an HTML element,
 * including its rendered gradient.
 *
 * @param selector A CSS selector identifying the target element.
 * @param options Set `useColorThief` to false to use the built-in
 * histogram extractor instead.
 * @returns A Promise resolving to a validated RGB tuple.
 */
export async function getDominantColorFromDiv(
  selector: string,
  { useColorThief = true }: DominantColorOptions = {},
): Promise<RGB> {
  let targetElement: HTMLElement | null;

  try {
    targetElement = document.querySelector<HTMLElement>(selector);
  } catch (error: unknown) {
    console.error(`Invalid CSS selector "${selector}":`, error);
    return [...FALLBACK_COLOR];
  }

  if (!targetElement) {
    console.warn(`Element matching "${selector}" not found.`);
    return [...FALLBACK_COLOR];
  }

  try {
    const canvas = await htmlToImage.toCanvas(targetElement, {
      width: 60,
      height: 60,
      style: {
        transform: "none",
        margin: "0",
        border: "none",
        outline: "none",
        boxShadow: "none",
      },
    });

    if (useColorThief) {
      try {
        const result = getColorSync(canvas);

        if (result) {
          const rgb = validateRGB(result.array());

          if (rgb) {
            return rgb;
          }
        }

        console.warn(
          `ColorThief could not extract a color from "${selector}", using fallback.`,
        );
      } catch (error: unknown) {
        console.warn(
          `ColorThief failed for "${selector}", using fallback:`,
          error,
        );
      }
    }

    return getDominantColorFromCanvas(canvas);
  } catch (error: unknown) {
    console.error("Failed to extract dominant color:", error);
    return [...FALLBACK_COLOR];
  }
}
