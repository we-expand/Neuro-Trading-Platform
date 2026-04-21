import { useEffect } from 'react';
const logoImage = "";

/**
 * Hook para atualizar o favicon dinamicamente com o logo Trade Hub
 */
export function useFavicon() {
  useEffect(() => {
    // Atualizar o título
    document.title = 'Trade Hub';
    
    // Encontrar ou criar o elemento favicon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Atualizar o href com a imagem do logo
    link.href = logoImage;
    
    console.log('[Favicon] ✅ Logo Trade Hub configurado');
  }, []);
}
