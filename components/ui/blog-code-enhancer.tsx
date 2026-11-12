'use client';

import { useEffect } from 'react';

export function BlogCodeEnhancer() {
  useEffect(() => {
    const preBlocks = document.querySelectorAll('article pre');

    preBlocks.forEach((pre) => {
      // Avoid duplicate enhancement
      if (pre.getAttribute('data-enhanced') === 'true') return;
      pre.setAttribute('data-enhanced', 'true');

      // Create Mac Terminal Header
      const wrapper = document.createElement('div');
      wrapper.className = 'my-8 rounded-xl overflow-hidden border border-zinc-700/60 bg-[#121217] shadow-2xl';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between px-4 py-2.5 bg-[#181820] border-b border-zinc-800 text-xs text-zinc-400 select-none';

      // Traffic lights
      const dots = document.createElement('div');
      dots.className = 'flex items-center gap-1.5';
      dots.innerHTML = `
        <span class="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-[#e0443e]/50"></span>
        <span class="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-[#dea123]/50"></span>
        <span class="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-[#1aab29]/50"></span>
      `;

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 hover:text-white transition-all text-[11px] font-mono cursor-pointer border border-zinc-700/50';
      copyBtn.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        <span>Copiar</span>
      `;

      copyBtn.addEventListener('click', async () => {
        const code = (pre.querySelector('code') as HTMLElement)?.innerText || (pre as HTMLElement).innerText || '';
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.innerHTML = `
            <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span class="text-emerald-400 font-bold">¡Copiado!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Copiar</span>
            `;
          }, 2000);
        } catch (e) {}
      });

      header.appendChild(dots);
      header.appendChild(copyBtn);

      // Insert wrapper before pre and move pre inside
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      // Clean default margins from pre inside wrapper
      pre.classList.add('!my-0', '!border-0', '!rounded-none', '!bg-transparent');
    });

    // Enhance images with window showcase frame
    const images = document.querySelectorAll('article .prose img');
    images.forEach((img) => {
      if (img.getAttribute('data-framed') === 'true') return;
      img.setAttribute('data-framed', 'true');
      img.classList.add(
        'rounded-xl',
        'border',
        'border-zinc-800',
        'shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
        'transition-all',
        'duration-300',
        'hover:border-zinc-600',
      );
    });
  }, []);

  return null;
}
