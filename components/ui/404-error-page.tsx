'use client';

import React from 'react';

// Inline SVG noise texture as a data URL — small (~600 bytes) and
// zero network round-trip. feTurbulence is unreliable when the host
// SVG has zero size (the filter region collapses), so we pre-render
// the noise at build time and tile it via CSS background-repeat.
// baseFrequency 0.9 / 1.1 gives the classic "fine static" texture.
// The feColorMatrix drops the alpha to ~22% so the noise tints the
// screen without overpowering the orange "NO SIGNAL" text.
const NOISE_BG = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">' +
  '<filter id="n">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.9 1.1" numOctaves="2" seed="7"/>' +
  '<feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.22 0"/>' +
  '</filter>' +
  '<rect width="100%" height="100%" filter="url(#n)"/>' +
  '</svg>'
)}")`;


// Inline `cn` to avoid pulling in clsx + tailwind-merge for one callsite.
// Ponytail: this stays local. Promote to lib/utils.ts when a second use appears.
const cn = (...inputs: Array<string | undefined | false | null>) =>
  inputs.filter(Boolean).join(' ');

interface RetroTvErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errorCode?: string;
  errorMessage?: string;
}

const RetroTvError = React.forwardRef<HTMLDivElement, RetroTvErrorProps>(
  (
    {
      className,
      errorCode = '404',
      errorMessage = 'NOT FOUND',
      ...props
    },
    ref
  ) => {
    const errorCodeDigits = errorCode.split('');

    return (
      <div
        ref={ref}
        className={cn('main_wrapper flex items-center justify-center', className)}
        {...props}
      >
        {/* SVG <defs> with feTurbulence — drives the white-noise overlay on
            the TV screen. Inline so there's no extra HTTP request; the filter
            is shared via <defs> so the same noise texture is reused across
            the page without recomputing per element. */}
        <div className="main">
          <div className="antenna">
            <div className="antenna_shadow"></div>
            <div className="a1"></div>
            <div className="a1d"></div>
            <div className="a2"></div>
            <div className="a2d"></div>
            <div className="a_base"></div>
          </div>
          <div className="tv">
            <div className="cruve">
              <svg
                viewBox="0 0 189.929 189.929"
                xmlns="http://www.w3.org/2000/svg"
                className="curve_svg"
              >
                <path d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z" />
              </svg>
            </div>
            <div className="display_div">
              <div className="screen_out">
                <div className="screen_out1">
                  <div className="screen">
                    {/* White-noise overlay — applies the feTurbulence
                        filter from the inline <defs> above. Sits above the
                        screen text so the signal is partially obscured
                        (visually authentic to a tuned-off analog TV). */}
                    <div className="tv_noise" style={{ backgroundImage: NOISE_BG }} aria-hidden />
                    <span className="notfound_text">{errorMessage}</span>
                  </div>
                  <div className="screenM">
                    {/* Animated duplicate of the screen text — pulses
                        horizontally to mimic CRT scanline drift. */}
                    <div className="tv_noise" style={{ backgroundImage: NOISE_BG }} aria-hidden />
                    <span className="notfound_text">{errorMessage}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lines">
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3"></div>
            </div>
            <div className="buttons_div">
              <div className="b1">
                <div></div>
              </div>
              <div className="b2"></div>
              <div className="speakers">
                <div className="g1">
                  <div className="g11"></div>
                  <div className="g12"></div>
                  <div className="g13"></div>
                </div>
                <div className="g"></div>
                <div className="g"></div>
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="base1"></div>
            <div className="base2"></div>
            <div className="base3"></div>
          </div>
        </div>
        <div className="text_404">
          {errorCodeDigits.map((digit, index) => (
            <div key={index} className={`text_404${index + 1}`}>
              {digit}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

RetroTvError.displayName = 'RetroTvError';

export { RetroTvError };