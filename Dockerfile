# Otimizado para cache Docker
# As dependências são instaladas primeiro para aproveitar cache

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Configurar variáveis de ambiente (cache layer)
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copiar apenas package.json primeiro (melhor cache)
COPY package.json ./

# Instalar dependências (esta camada só muda se package.json mudar)
RUN npm install --only=production && npm cache clean --force

# Copiar código da aplicação (por último para não invalidar cache das deps)
COPY . .

# Expor porta
EXPOSE 8080

# Comando de execução
CMD ["npm", "start"]
