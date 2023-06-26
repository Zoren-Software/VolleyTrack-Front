<template>
  <div v-if="cpf" class="flex items-center">
    <ZSpanCopyClipboard ref="cpfEl" ref-name="cpfEl" label="CPF" :text="formatCpf(cpf)" />
  </div>
  <div v-if="rg" class="flex items-center">
    <ZSpanCopyClipboard ref="rgEl" ref-name="rgEl" label="RG" :text="rg" />
  </div>
</template>

<script>

import Clipboard from 'clipboard';
import ZSpanCopyClipboard from '~/components/atoms/Span/ZSpanCopyClipboard';

export default {
  components: {
    ZSpanCopyClipboard
  },
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