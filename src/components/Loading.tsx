'use client';
import { animate } from 'animejs';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface LoadingProps {
  /** Minimum duration of loading in milliseconds */
  minDuration?: number;
  /** Content to show after loading completes */
  children?: React.ReactNode;
  /** Optional custom background color for the loading screen */
  backgroundColor?: string;
  /** Optional custom box color */
  boxBorderColor?: string;
  /** Callback function executed when loading completes */
  onLoadingComplete?: () => void;
}

export default function Loading({
  minDuration = 1000,
  children,
  backgroundColor = 'white',
  boxBorderColor = 'black',
  onLoadingComplete,
}: LoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerBoxRef = useRef<HTMLDivElement>(null);
  const [boxRect, setBoxRect] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const animationsRef = useRef<any[]>([]);

  // Track both minimum duration and page load status
  const [minDurationMet, setMinDurationMet] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const updateRect = () => {
      if (!containerRef.current || !centerBoxRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const box = centerBoxRef.current.getBoundingClientRect();
      setBoxRect({
        top: box.top - container.top,
        left: box.left - container.left,
      });
    };

    const observer = new ResizeObserver(updateRect);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    if (centerBoxRef.current) {
      observer.observe(centerBoxRef.current);
    }

    window.addEventListener('resize', updateRect);
    updateRect();

    // Handle minimum duration
    const timeout = setTimeout(() => {
      setMinDurationMet(true);
    }, minDuration);

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      setPageLoaded(true);
    } else {
      // Listen for the page to be fully loaded
      window.addEventListener('load', () => setPageLoaded(true));
    }

    return () => {
      window.removeEventListener('resize', updateRect);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [minDuration]);

  // Update loading state when both conditions are met
  useEffect(() => {
    if (minDurationMet && pageLoaded && isLoading) {
      setIsLoading(false);
      onLoadingComplete?.();
    }
  }, [minDurationMet, pageLoaded, isLoading, onLoadingComplete]);

  useEffect(() => {
    // Clear previous animations
    animationsRef.current.forEach((anim) => {
      if (anim && typeof anim.pause === 'function') {
        anim.pause();
      }
    });
    animationsRef.current = [];

    if (isLoading) {
      // Start loading animations
      [0, 1, 2].forEach((i) => {
        const animation = animate(`.box-${i}`, {
          width: '4rem',
          height: '4rem',
          duration: 700,
          easing: 'inQuad',
          alternate: true,
          loop: true,
          delay: i * 250,
        });
        animationsRef.current.push(animation);
      });
    } else {
      // Smoothly transition back to initial state
      [0, 1, 2].forEach((i) => {
        const el = document.querySelector(`.box-${i}`);
        if (el) {
          // Animate back to original size with a smooth transition
          const finalAnimation = animate(`.box-${i}`, {
            width: [
              { to: '2rem', duration: 500 },
              { to: '101vw', delay: 200, duration: 1000 },
            ],
            height: [
              { to: '2rem', duration: 500 },
              { to: '101vh', delay: 200, duration: 500 },
            ],
            duration: 2000,
            easing: 'easeOutQuad',
          });
          animationsRef.current.push(finalAnimation);
        }
      });
    }

    return () => {
      // Cleanup animations when component unmounts or effect re-runs
      animationsRef.current.forEach((anim) => {
        if (anim && typeof anim.pause === 'function') {
          anim.pause();
        }
      });
    };
  }, [isLoading]);

  const masks = {
    top: {
      top: 0,
      left: 0,
      width: '100%',
      height: `${boxRect.top}px`,
    },
    bottom: {
      bottom: 0,
      left: 0,
      width: '100%',
      height: `${boxRect.top}px`,
    },
    left: {
      top: 0,
      left: 0,
      height: '100vh',
      width: `${boxRect.left}px`,
    },
    right: {
      top: 0,
      right: 0,
      height: '100vh',
      width: `${boxRect.left}px`,
    },
  };

  return (
    <>
      {!isLoading && children}
      <section
        ref={containerRef}
        className={cn(
          'fixed top-0 left-0 z-[9999] flex min-h-screen w-full items-center justify-center',
          'max-h-screen max-w-screen overflow-hidden',
          'transition-all duration-800',
          !isLoading && 'pointer-events-none bg-transparent delay-350',
        )}
        style={{ backgroundColor: isLoading ? backgroundColor : 'transparent' }}
      >
        {/* Masks */}
        {Object.entries(masks).map(([key, style]) => (
          <div
            key={key}
            className='mask absolute'
            style={{
              ...(style as React.CSSProperties),
              backgroundColor: backgroundColor,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        ))}

        {/* Kotak animasi */}
        <div className='z-[9999] flex items-center gap-3'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={i === 1 ? centerBoxRef : null}
              className={cn(
                'h-8 w-8 origin-right border-2 bg-transparent',
                `box-${i}`,
              )}
              style={{
                borderColor: boxBorderColor,
                transition: !isLoading ? 'all 0.5s ease-out' : 'none',
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
