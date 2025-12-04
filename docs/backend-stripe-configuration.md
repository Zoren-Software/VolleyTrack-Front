# Configuração do Backend para Stripe Checkout

## Problema
O email do usuário não está aparecendo pré-preenchido no checkout do Stripe.

## Solução
O backend Laravel deve usar o parâmetro `customer_email` ao criar a sessão do Stripe Checkout.

## Configuração no Backend Laravel

### 1. Controller de Checkout

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class CheckoutController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        try {
            // Configurar chave secreta do Stripe
            Stripe::setApiKey(config('services.stripe.secret'));

            // Validar dados da requisição
            $request->validate([
                'price_id' => 'required|string',
                'customer_email' => 'required|email',
                'success_url' => 'required|url',
                'cancel_url' => 'required|url',
                'mode' => 'required|in:payment,subscription',
                'quantity' => 'integer|min:1',
            ]);

            // Criar sessão do Stripe Checkout
            $session = Session::create([
                'payment_method_types' => ['card'],
                'customer_email' => $request->customer_email, // ← IMPORTANTE: Usar customer_email
                'line_items' => [[
                    'price' => $request->price_id,
                    'quantity' => $request->quantity ?? 1,
                ]],
                'mode' => $request->mode,
                'success_url' => $request->success_url . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->cancel_url,
                'metadata' => [
                    'user_email' => $request->customer_email,
                    'created_at' => now()->toISOString(),
                ],
            ]);

            return response()->json([
                'success' => true,
                'session_id' => $session->id,
                'url' => $session->url,
                'data' => [
                    'id' => $session->id,
                    'url' => $session->url,
                    'mode' => $session->mode,
                    'amount_total' => $session->amount_total,
                    'customer_email' => $session->customer_email,
                    'payment_status' => $session->payment_status,
                ],
                'message' => 'Checkout session created successfully'
            ]);

        } catch (\Stripe\Exception\InvalidRequestException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar sessão de checkout: ' . $e->getMessage(),
                'error_code' => $e->getStripeCode()
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage(),
                'error_code' => null
            ], 500);
        }
    }

    public function getCheckoutSession($sessionId)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $session = Session::retrieve($sessionId);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $session->id,
                    'mode' => $session->mode,
                    'amount_total' => $session->amount_total,
                    'customer_email' => $session->customer_email,
                    'payment_status' => $session->payment_status,
                    'subscription' => $session->subscription,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao consultar sessão: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

### 2. Rotas da API

```php
// routes/api.php

Route::post('/v1/checkout-session', [CheckoutController::class, 'createCheckoutSession']);
Route::get('/v1/checkout-session/{sessionId}', [CheckoutController::class, 'getCheckoutSession']);
```

### 3. Configuração do Stripe

```php
// config/services.php

'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
],
```

### 4. Variáveis de Ambiente

```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

## Verificação

### 1. Teste da API
```bash
curl -X POST http://api.volleytrack.local/v1/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_1234567890",
    "customer_email": "usuario@exemplo.com",
    "success_url": "https://app.volleytrack.com/payment/success",
    "cancel_url": "https://app.volleytrack.com/payment/cancel",
    "mode": "subscription",
    "quantity": 1
  }'
```

### 2. Resposta Esperada
```json
{
  "success": true,
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "data": {
    "id": "cs_test_...",
    "url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "mode": "subscription",
    "amount_total": 2999,
    "customer_email": "usuario@exemplo.com",
    "payment_status": "unpaid"
  },
  "message": "Checkout session created successfully"
}
```

## Debugging

### 1. Verificar Logs do Backend
```bash
tail -f storage/logs/laravel.log
```

### 2. Verificar Logs do Frontend
No console do navegador, verifique:
- Email do usuário obtido
- Dados sendo enviados para a API
- Resposta da API

### 3. Testar no Stripe Dashboard
1. Acesse https://dashboard.stripe.com/test/events
2. Procure por eventos de "checkout.session.created"
3. Verifique se o `customer_email` está sendo definido corretamente

## Solução de Problemas

### Problema: Email não aparece pré-preenchido
**Causa:** Backend não está usando `customer_email` na criação da sessão
**Solução:** Verificar se o parâmetro está sendo passado corretamente para `Session::create()`

### Problema: Email aparece mas pode ser alterado
**Causa:** Comportamento padrão do Stripe
**Solução:** Implementar validação no webhook para verificar se o email foi alterado

### Problema: Erro 500 ao criar sessão
**Causa:** Configuração incorreta do Stripe ou dados inválidos
**Solução:** Verificar logs do backend e configuração do Stripe
