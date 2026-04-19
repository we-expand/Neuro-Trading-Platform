#!/bin/bash

# Script de deploy automático para Neural Day Trader
# Configuração para deploy contínuo na Vercel

echo "🚀 Iniciando deploy do Neural Day Trader..."

# Limpar cache antes do build
echo "🧹 Limpando cache..."
npm run clear-cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Buildando projeto..."
npm run build

# Deploy para produção na Vercel
echo "🌐 Fazendo deploy para produção..."
vercel --prod

echo "✅ Deploy concluído com sucesso!"
echo "🌍 Aplicação disponível em: https://www.neuraldaytrader.com"
