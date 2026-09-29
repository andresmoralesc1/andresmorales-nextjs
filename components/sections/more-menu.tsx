'use client';

import Link from 'next/link';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

interface LinkItem {
  href: string;
  title: string;
  description?: string;
}

interface Props {
  trigger: string;
  learnLabel: string;
  learnDescription: string;
  ctaLabel: string;
  ctaHref: string;
  items: LinkItem[];
}

/**
 * Server-friendly wrapper around the Radix NavigationMenu primitive.
 * Used by the desktop header for the 'More' mega-menu trigger.
 *
 * Why this exists (instead of inlining the primitive in the header):
 *   - Keeps the header file free of UI primitives — it only deals
 *     with layout.
 *   - Centralizes the 'Learn' section shape (header + 4 items) so a
 *     future second section (e.g. 'Compare') just adds another
 *     <NavigationMenuContent> here, not in the header.
 *
 * Radix provides the auto-centering viewport, the indicator arrow,
 * keyboard navigation, and a hover-intent (the menu doesn't close
 * when the cursor traverses the trigger-to-panel gap).
 */
export function MoreMenu({
  trigger,
  learnLabel,
  learnDescription,
  ctaLabel,
  ctaHref,
  items,
}: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {/* Trigger uses the Radix primitive directly instead of the
              shadcn wrapper because navigationMenuTriggerStyle() ships
              with bg-background + hover:bg-accent (a filled-pill look)
              and tailwind-merge can't resolve those when our nav
              links use no background fill — the conflicting classes
              were stacking instead of overriding. The primitive
              renders the chevron + open-state rotation for free, so we
              only need to add the link-underline + nav-link classes. */}
          <NavigationMenuPrimitive.Trigger className="group link-underline inline-flex items-center gap-1.5 py-1 text-base font-medium tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm text-secondary hover:text-accent data-[state=open]:text-accent">
            {trigger}
            <ChevronDownIcon
              className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </NavigationMenuPrimitive.Trigger>
          <NavigationMenuContent>
            {/* Glossy translucent background. bg-background/80 keeps the
                panel readable when the page content scrolls behind it;
                backdrop-blur-md softens the page text into a tasteful
                frosted blur; the ring + shadow on top give the panel
                edge a clear boundary. Width matches the viewport
                width from the primitive (no override). */}
            <div className="p-4 md:p-5 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-theme-9 bg-background/90 backdrop-blur-md shadow-lg">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold">
                  {learnLabel}
                </p>
                <p className="text-sm text-text mt-1">
                  {learnDescription}
                </p>
              </div>
              <ul className="grid gap-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-theme-1/10 hover:text-accent focus:bg-theme-1/10"
                      >
                        <div className="text-sm font-medium leading-none text-secondary">
                          {item.title}
                        </div>
                        {item.description ? (
                          <p className="line-clamp-2 text-xs text-text leading-snug mt-1">
                            {item.description}
                          </p>
                        ) : null}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-theme-9">
                <NavigationMenuLink asChild>
                  <Link
                    href={ctaHref}
                    className="text-sm font-secondary font-bold text-accent hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
                  >
                    {ctaLabel} <span aria-hidden="true">→</span>
                  </Link>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
