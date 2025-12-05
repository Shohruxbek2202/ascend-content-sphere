import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const AnalyticsScripts = () => {
  const { settings, isLoading } = useSiteSettings();

  useEffect(() => {
    if (isLoading) return;

    // Google Analytics 4
    if (settings.ga4_measurement_id) {
      const existingGaScript = document.getElementById('ga4-script');
      if (!existingGaScript) {
        const gaScript = document.createElement('script');
        gaScript.id = 'ga4-script';
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga4_measurement_id}`;
        document.head.appendChild(gaScript);

        const gaConfigScript = document.createElement('script');
        gaConfigScript.id = 'ga4-config';
        gaConfigScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.ga4_measurement_id}');
        `;
        document.head.appendChild(gaConfigScript);
      }
    }

    // Google Tag Manager
    if (settings.gtm_container_id) {
      const existingGtmScript = document.getElementById('gtm-script');
      if (!existingGtmScript) {
        const gtmScript = document.createElement('script');
        gtmScript.id = 'gtm-script';
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${settings.gtm_container_id}');
        `;
        document.head.appendChild(gtmScript);

        // GTM noscript for body
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.id = 'gtm-noscript';
        gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_container_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);
      }
    }

    // Meta Pixel (Facebook Pixel)
    if (settings.meta_pixel_id) {
      const existingFbPixel = document.getElementById('fb-pixel');
      if (!existingFbPixel) {
        const fbPixelScript = document.createElement('script');
        fbPixelScript.id = 'fb-pixel';
        fbPixelScript.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${settings.meta_pixel_id}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(fbPixelScript);

        const fbPixelNoscript = document.createElement('noscript');
        fbPixelNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1"/>`;
        document.head.appendChild(fbPixelNoscript);
      }
    }
  }, [settings, isLoading]);

  return null;
};