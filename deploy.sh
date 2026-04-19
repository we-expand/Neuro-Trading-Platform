#!/bin/bash

# ============================================================
# 🚀 DEPLOY AUTOMÁTICO - Neural Day Trader
# ============================================================
# Uso: ./deploy.sh "mensagem do commit"
# Exemplo: ./deploy.sh "fix: logo do dashboard corrigido"
#
# O script faz:
#   1. git add (todos os arquivos modificados)
#   2. git commit com a mensagem
#   3. git push para GitHub → Vercel faz deploy automático!
# ============================================================

set -e  # Para o script se der erro

# Cor para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Pega a mensagem do commit (ou usa uma padrão)
COMMIT_MSG="${1:-"chore: atualização automática"}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🧠 Neural Day Trader - Deploy          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Verifica se tem alterações para commitar
if [[ -z "$(git status --porcelain)" ]]; then
  echo -e "${YELLOW}⚠️  Nenhuma alteração detectada. Nada para fazer!${NC}"
  exit 0
fi

echo -e "${BLUE}📋 Alterações detectadas:${NC}"
git status --short
echo ""

echo -e "${GREEN}📦 Adicionando todos os arquivos...${NC}"
git add .

echo -e "${GREEN}💾 Commitando: \"${COMMIT_MSG}\"${NC}"
git commit -m "${COMMIT_MSG}"

echo -e "${GREEN}🚀 Enviando para GitHub...${NC}"
git push origin main

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deploy iniciado com sucesso!          ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  A Vercel está buildando o projeto...    ║${NC}"
echo -e "${GREEN}║  🌍 https://www.neuraldaytrader.com      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🔍 Acompanhe o deploy em: https://vercel.com/we-expand/neural_day_trader${NC}"
echo ""
