# Guia de Ícones Material Icons

Este documento lista os ícones do Material Icons que estão sendo usados no projeto e suas alternativas.

## Ícones Atualizados

### Ícones de Sucesso/Vitória
- `emoji_events` - Troféu (substitui "trophy")
- `star` - Estrela
- `favorite` - Coração
- `thumb_up` - Polegar para cima

### Ícones de Aviso/Erro
- `warning` - Aviso (substitui "exclamation-triangle")
- `error` - Erro
- `error_outline` - Erro com contorno
- `cancel` - Cancelar

### Ícones de Informação
- `info_outline` - Informação (substitui "info")
- `help_outline` - Ajuda
- `question_mark` - Interrogação

### Ícones de Esportes/Vôlei
- `sports_volleyball` - Vôlei (usado para Recepção)
- `fiber_smart_record` - Gravação (usado para Saque)
- `bolt` - Raio (usado para Ataque)
- `do_not_touch` - Não tocar (usado para Bloqueio)
- `shield` - Escudo (usado para Defesa)
- `sign_language` - Linguagem de sinais (usado para Levantamento)

**Nota**: O ícone "guardian" (Material Symbols) estava causando problemas de compatibilidade com o Vuestic UI, então foi substituído por "sports_volleyball".

### Ícones de Interface
- `save` - Salvar
- `users` - Usuários
- `account_circle` - Perfil de usuário
- `visibility` - Visibilidade (substitui "remove_red_eye")
- `visibility_off` - Visibilidade desligada
- `search` - Pesquisar
- `edit` - Editar
- `delete` - Deletar
- `close` - Fechar
- `checked` - Verificado
- `pending` - Pendente
- `menu` - Menu
- `menu_open` - Menu aberto
- `notifications` - Notificações
- `phone` - Telefone
- `email` - Email
- `event` - Evento
- `content_copy` - Copiar conteúdo
- `assessment` - Relatório (substitui "report")

## Como Usar

Para usar um ícone, simplesmente adicione o nome no atributo `name` do componente `va-icon`:

```vue
<va-icon name="emoji_events" color="success" />
```

## Variações Disponíveis

O projeto agora inclui todas as variações do Material Icons e Material Symbols:

### Material Icons (Clássico)
- `Material+Icons` - Padrão
- `Material+Icons+Outlined` - Com contorno
- `Material+Icons+Round` - Arredondado
- `Material+Icons+Sharp` - Pontiagudo
- `Material+Icons+Two+Tone` - Duas cores

### Material Symbols (Nova Versão)
- `Material+Symbols+Outlined` - Com contorno
- `Material+Symbols+Rounded` - Arredondado
- `Material+Symbols+Sharp` - Pontiagudo

**Nota**: Material Symbols é a versão mais nova e inclui ícones como "guardian" que não estão disponíveis no Material Icons clássico.

## Referência Completa

Para ver todos os ícones disponíveis:
- **Material Icons (Clássico)**: https://fonts.google.com/icons?selected=Material+Icons
- **Material Symbols (Nova Versão)**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined 