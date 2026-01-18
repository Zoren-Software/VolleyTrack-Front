#!/bin/bash

# Script para aumentar o limite de file watchers no Linux
# Execute com: bash fix-watchers.sh

echo "🔧 Ajustando limite de file watchers..."

# Verificar se já existe a configuração
if grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf 2>/dev/null; then
    echo "⚠️  Configuração já existe em /etc/sysctl.conf"
    echo "📝 Atualizando valor..."
    sudo sed -i 's/fs.inotify.max_user_watches=.*/fs.inotify.max_user_watches=524288/' /etc/sysctl.conf
else
    echo "➕ Adicionando configuração em /etc/sysctl.conf..."
    echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
fi

# Aplicar configuração imediatamente
echo "🔄 Aplicando configuração..."
sudo sysctl -p

# Verificar valor atual
CURRENT_VALUE=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "✅ Limite atual de file watchers: $CURRENT_VALUE"
echo ""
echo "💡 Se o valor ainda estiver baixo, você pode precisar reiniciar o sistema."
echo "🚀 Agora você pode executar 'pnpm dev' sem problemas de file watchers!"

