import { forwardRef } from 'react';
import {
  Link as RRLink,
  LinkProps,
  NavigateOptions,
  To,
  useLocation,
  useNavigate as useRRNavigate,
} from 'react-router-dom';

export type Lang = 'en' | 'uz' | 'ru';
export const LANG_PREFIXES: Lang[] = ['uz', 'ru'];

/**
 * Prepend the active language prefix to an internal path.
 * - External URLs, mail/tel/hash links → returned unchanged
 * - /admin, /auth → never prefixed
 * - `en` → no prefix
 * - already-prefixed path → prefix is swapped
 */
export function localizedPath(path: string, lang: Lang): string {
  if (!path || typeof path !== 'string') return path;
  if (
    /^([a-z][a-z0-9+.-]*:)/i.test(path) || // absolute URL / mailto / tel
    path.startsWith('#') ||
    path.startsWith('?')
  ) {
    return path;
  }
  if (path.startsWith('/admin') || path.startsWith('/auth')) return path;

  // Strip an existing language prefix
  const parts = path.split('/');
  let bare = path;
  if (parts.length > 1 && LANG_PREFIXES.includes(parts[1] as Lang)) {
    bare = '/' + parts.slice(2).join('/');
    if (bare === '/') bare = '/';
  }

  if (lang === 'en') return bare === '' ? '/' : bare;
  const suffix = bare === '/' ? '' : bare;
  return `/${lang}${suffix}`;
}

export function getLangFromPath(pathname: string): Lang {
  const seg = pathname.split('/')[1];
  return (seg === 'uz' || seg === 'ru') ? seg : 'en';
}

function useCurrentLang(): Lang {
  const { pathname } = useLocation();
  return getLangFromPath(pathname);
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function LocalizedLink(
  { to, ...rest },
  ref,
) {
  const lang = useCurrentLang();
  let next: To = to;
  if (typeof to === 'string') {
    next = localizedPath(to, lang);
  } else if (to && typeof to === 'object' && 'pathname' in to && to.pathname) {
    next = { ...to, pathname: localizedPath(to.pathname, lang) };
  }
  return <RRLink ref={ref} to={next} {...rest} />;
});

export function useNavigate() {
  const nav = useRRNavigate();
  const lang = useCurrentLang();
  return (to: To | number, opts?: NavigateOptions) => {
    if (typeof to === 'number') return nav(to);
    if (typeof to === 'string') return nav(localizedPath(to, lang), opts);
    if (to && typeof to === 'object' && 'pathname' in to && to.pathname) {
      return nav({ ...to, pathname: localizedPath(to.pathname, lang) }, opts);
    }
    return nav(to as To, opts);
  };
}
