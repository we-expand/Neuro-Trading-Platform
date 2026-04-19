import React from 'react';
import { motion } from 'motion/react';
import { NeuralLogo as NeuralLogoIcon } from './NeuralLogo';

// Animation handled via CSS and SVG SMIL

interface LogoProps {
  variant?: 'full' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const BrandLogo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md',
  animated = true 
}) => {
  // Tamanhos do TEXTO (mantidos originais)
  const textScales = {
    sm: { text: 'text-lg', subtext: 'text-[10px]' },
    md: { text: 'text-3xl', subtext: 'text-sm' },
    lg: { text: 'text-5xl', subtext: 'text-lg' },
    xl: { text: 'text-7xl', subtext: 'text-3xl' }
  };

  const currentText = textScales[size];

  return (
    <motion.div 
      className="flex items-center gap-3 select-none cursor-pointer"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300, damping: 10 }
      }}
    >
      {/* LOGO SVG VETORIAL (ícone pequeno) */}
      {variant === 'icon-only' ? (
        <NeuralLogoIcon size={size} animated={animated} />
      ) : (
        <div className="flex items-center gap-3">
          <NeuralLogoIcon size={size} animated={animated} />
          
          {/* LOGOTIPO TIPOGRÁFICO (tamanho original mantido) */}
          <div className="flex flex-col justify-center items-center" style={{ transform: "translateZ(30px)" }}>
            <h1 className={`font-sans tracking-[0.25em] font-light text-white ${currentText.text} leading-none`}
                style={{ 
                  textShadow: "0 4px 8px rgba(0,0,0,0.5), 0 0 10px rgba(34,211,238,0.3)" 
                }}
            >
              NEURAL
            </h1>
            <motion.span 
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-white ${currentText.subtext} tracking-[0.58em] uppercase leading-none mt-1`}
               style={{ 
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}
            >
              TRADER
            </motion.span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Exportar também como NeuralLogo para compatibilidade com código existente
export const NeuralLogo = BrandLogo;