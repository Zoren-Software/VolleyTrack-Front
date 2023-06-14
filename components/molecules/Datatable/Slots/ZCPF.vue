<template>
  <div v-if="cpf" class="flex items-center">
    <span ref="cpfEl" class="mr-2 va-text-secondary" v-once>CPF:</span>
    <span ref="cpfEl" class="mr-2" v-once>{{ formatCpf(cpf) }}</span>
    <va-icon size="small" name="content_copy" color="primary" @click="copyToClipboardCPF" />
  </div>
  <div v-if="rg" class="flex items-center">
    <span ref="cpfEl" class="mr-2 va-text-secondary" v-once>RG:</span>
    <span ref="rgEl" class="mr-2" v-once>{{ rg }}</span>
    <va-icon size="small" name="content_copy" color="primary" @click="copyToClipboardRG" />
  </div>
</template>

<script>

import Clipboard from 'clipboard';

export default {
  props: {
    cpf: {
      type: String,
      required: false
    },
    rg: {
      type: String,
      required: false
    },
  },
  methods: {
    formatCpf(cpf) {
      cpf = cpf.replace(/\D/g, "");
      cpf = cpf.padStart(11, "0");
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    },
    
    copyToClipboardCPF() {
      try {
        if (!this.clipboard) {
          this.clipboard = new Clipboard(this.$refs.cpfEl, {
            text: () => this.formatCpf(this.cpf)
          });

          this.clipboard.on('success', function(e) {
            console.log('CPF copied to clipboard');
            e.clearSelection();
          });
        }

        // NOTE - Simular um click no elemento para acionar a cópia para o clipboard.
        this.$refs.cpfEl.click();

      } catch (error) {
        console.error('Error in copyToClipboardCPF: ', error);
      }
    },
    copyToClipboardRG() {
      try {
        if (!this.clipboard) {
          this.clipboard = new Clipboard(this.$refs.rgEl, {
            text: () => this.rg
          });

          this.clipboard.on('success', function(e) {
            console.log('RG copied to clipboard');
            e.clearSelection();
          });
        }

        // NOTE - Simular um click no elemento para acionar a cópia para o clipboard.
        this.$refs.rgEl.click();

      } catch (error) {
        console.error('Error in copyToClipboardRG: ', error);
      }
    }
  },
  beforeDestroy() {
    // NOTE - limpa a instância do Clipboard quando o componente é destruído
    if (this.clipboard) {
      this.clipboard.destroy(); 
    }
  }
}
</script>