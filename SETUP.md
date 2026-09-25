# Setup Instructions

## 1. Criar Upstash Redis Database

1. Acesse [Upstash Console](https://console.upstash.com/)
2. Crie uma conta gratuita
3. Crie um novo database Redis
4. Copie as credenciais:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

## 2. Configurar Variáveis de Ambiente

No Vercel:
1. Vá para as configurações do projeto
2. Adicione as variáveis de ambiente:
   - `UPSTASH_REDIS_REST_URL` = sua URL do Upstash
   - `UPSTASH_REDIS_REST_TOKEN` = seu token do Upstash

Localmente:
Crie um arquivo `.env.local` com:
```
UPSTASH_REDIS_REST_URL=sua_url_aqui
UPSTASH_REDIS_REST_TOKEN=seu_token_aqui
```

## 3. Deploy no Vercel

```bash
vercel
```

O contador será compartilhado entre todos os dispositivos que acessarem a aplicação.
