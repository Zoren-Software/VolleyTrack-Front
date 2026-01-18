# Correção do Erro 403 na API de Contador de Planos Vitalícios

## Problema

Erro **403 Forbidden** ao tentar acessar a rota:
```
http://api.volleytrack.local:3000/v1/customers/lifetime-plans-count
```

## Causa

O service `lifetimePlanService.js` estava usando `window.origin` para construir a URL da API, que **inclui a porta 3000** do frontend Nuxt:

```javascript
// ❌ ERRADO - Incluía a porta do frontend
const API_BASE_URL = process.client 
  ? window.origin.replace(window.location.hostname.split('.')[0], 'api') 
  : '';
```

**Resultado:**
- Frontend em: `http://localhost:3000`
- `window.origin`: `http://localhost:3000`
- URL gerada: `http://api:3000/...` ❌ (errado!)

## Solução

Criamos uma função `getApiBaseUrl()` que constrói a URL da API **sem incluir a porta**:

```javascript
// ✅ CORRETO - Constrói URL sem porta
const getApiBaseUrl = () => {
  if (!process.client) return '';
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Se for localhost ou apenas hostname sem subdomínio, usar api.volleytrack.local
  if (hostname === 'localhost' || !hostname.includes('.')) {
    return `${protocol}//api.volleytrack.local`;
  }
  
  // Substituir primeiro subdomínio por 'api' (ex: app.volleytrack.local -> api.volleytrack.local)
  const parts = hostname.split('.');
  parts[0] = 'api';
  return `${protocol}//${parts.join('.')}`;
};

const API_BASE_URL = getApiBaseUrl();
```

## Como Funciona

### Cenário 1: localhost:3000
```
Frontend: http://localhost:3000
API URL: http://api.volleytrack.local ✅
```

### Cenário 2: app.volleytrack.local:3000
```
Frontend: http://app.volleytrack.local:3000
API URL: http://api.volleytrack.local ✅
```

### Cenário 3: Produção (sem porta)
```
Frontend: https://app.exemplo.com
API URL: https://api.exemplo.com ✅
```

## Testes

**Antes da correção:**
```bash
# Frontend tentava acessar (ERRO 403):
curl http://api.volleytrack.local:3000/v1/customers/lifetime-plans-count
# Porta 3000 não existe no backend!
```

**Depois da correção:**
```bash
# Frontend agora acessa corretamente:
curl http://api.volleytrack.local/v1/customers/lifetime-plans-count
# ✅ Retorna: {"success":true,"data":{...}}
```

## Verificação

Para testar se a correção funcionou:

1. **Abrir console do navegador** na página `/payment`
2. **Verificar logs:**
   ```
   📊 Buscando contador de planos vitalícios
   🔍 URL da requisição: http://api.volleytrack.local/v1/customers/lifetime-plans-count
   🔍 Response status: 200
   ✅ Contador obtido com sucesso: { total_sold: 1, remaining: 499, ... }
   ```

3. **Verificar que não aparece a porta 3000 na URL**

## Arquivos Modificados

- `services/lifetimePlanService.js` - Corrigida construção da URL da API

## Lições Aprendidas

1. **Nunca usar `window.origin`** para construir URLs de APIs em ambientes com porta customizada
2. **Sempre construir URLs** usando `protocol` + `hostname` separadamente
3. **Testar em localhost** onde frontend e backend rodam em portas diferentes

## Alternativa Futura

Para projetos maiores, considerar usar variável de ambiente:

```javascript
// nuxt.config.ts
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://api.volleytrack.local'
  }
}

// No service
const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBaseUrl;
```

Isso torna o código mais explícito e facilita a configuração por ambiente (dev, staging, prod).

