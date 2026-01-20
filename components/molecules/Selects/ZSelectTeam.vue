<template>
  <ZSelect
    v-model="internalValue"
    v-bind="$attrs"
    :label="label"
    :options="items"
    :loading="loading"
    multiple
    return-object
    @click="getTeams(true)"
    @scrollBottom="loadMore"
    @updateSearch="newSearch"
  >
    <!-- Debug: mostrar quantidade de itens -->
    <template v-if="false" #default>
      <div style="padding: 10px; background: yellow;">
        Debug: {{ items.length }} itens disponíveis
      </div>
    </template>
  </ZSelect>
</template>

<script>
import ZSelect from "~/components/atoms/Select/ZSelect";
import TEAMS from "~/graphql/team/query/teams.graphql";

export default {
  components: {
    ZSelect,
  },
  props: {
    modelValue: {
      type: [Array, Object],
      default: () => [],
    },
    label: {
      type: String,
      required: true,
    },
    positionsIds: {
      type: Array,
      required: false,
    },
    ignoreIds: {
      type: Array,
      required: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      hasMoreItems: true,
      loading: false,
      items: [],
      variablesGetTeams: {
        page: 1,
        first: 10,
        filter: {
          search: "%%",
          positionsIds: this.positionsIds,
          ignoreIds: this.ignoreIds,
        },
      },
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue || [];
      },
      set(newValue) {
        this.$emit("update:modelValue", newValue);
      },
    },
  },

  watch: {
    positionsIds(newVal) {
      this.variablesGetTeams.filter.positionsIds = newVal.map((item) =>
        Number(item.value)
      );
      this.getTeams();
    },
    ignoreIds(newVal) {
      this.variablesGetTeams.filter.ignoreIds = newVal.map((item) => {
        return Number(item);
      });
      this.getTeams();
    },
    items(newItems) {
      console.log('ZSelectTeam - Items mudaram, nova quantidade:', newItems.length);
      console.log('ZSelectTeam - Items:', newItems);
    },
  },

  methods: {
    async getTeams(click = false) {
      console.log('ZSelectTeam - getTeams chamado, click:', click);
      
      if (click) {
        this.items = [];
        this.variablesGetTeams.page = 1;
      }
      
      // Evitar múltiplas chamadas simultâneas
      if (this.loading) {
        console.log('ZSelectTeam - Já está carregando, ignorando chamada');
        return;
      }
      
      this.loading = true;

      try {
        const query = gql`
          ${TEAMS}
        `;

        console.log('ZSelectTeam - Executando query com variáveis:', this.variablesGetTeams);

        // Usar o cliente Apollo diretamente
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;

        if (!apolloClient) {
          console.error('ZSelectTeam - Cliente Apollo não encontrado');
          this.loading = false;
          return;
        }

        const result = await apolloClient.query({
          query,
          variables: this.variablesGetTeams,
          fetchPolicy: 'network-only',
        });

        console.log('ZSelectTeam - Resultado da query:', result);

        if (result?.data) {
          this.handleResult(result.data);
        } else {
          console.log('ZSelectTeam - Nenhum dado no resultado');
          this.loading = false;
          this.hasMoreItems = false;
        }
      } catch (error) {
        console.error('ZSelectTeam - Erro ao buscar times:', error);
        this.loading = false;
        this.hasMoreItems = false;
      }
    },

    handleResult(result) {
      console.log('ZSelectTeam - handleResult chamado:', result);
      
      if (!result) {
        console.log('ZSelectTeam - Sem resultado');
        this.loading = false;
        this.hasMoreItems = false;
        return;
      }

      if (result?.teams?.data && result.teams.data.length > 0) {
        console.log('ZSelectTeam - Processando', result.teams.data.length, 'times');
        this.paginatorInfo = result.teams.paginatorInfo;

        const newItems = result.teams.data.map((item) => {
          return {
            text: item.name,
            value: Number(item.id),
          };
        });

        const allItems = [...this.items, ...newItems];

        const uniqueItems = Array.from(
          new Set(allItems.map((a) => a.value))
        ).map((value) => {
          return allItems.find((a) => a.value === value);
        });

        console.log('ZSelectTeam - Itens atualizados:', uniqueItems.length);
        console.log('ZSelectTeam - Itens:', uniqueItems);
        this.items = uniqueItems;
        this.hasMoreItems = result.teams.paginatorInfo.hasMorePages;
        
        // Forçar atualização do componente
        this.$nextTick(() => {
          this.$forceUpdate();
          console.log('ZSelectTeam - Componente atualizado, items.length:', this.items.length);
        });
      } else {
        console.log('ZSelectTeam - Nenhum time encontrado');
        this.hasMoreItems = false;
      }
      
      this.loading = false;
    },
    newSearch(newSearchValue) {
      this.variablesGetTeams.filter.search = `%${newSearchValue}%`;
      this.getTeams();
    },
    loadMore() {
      if (!this.hasMoreItems) {
        return;
      }
      this.variablesGetTeams.page += 1;
      this.getTeams();
    },
    // Método helper para buscar um item pelo valor
    getItemByValue(value) {
      return this.items.find((item) => item.value === value);
    },
  },
};
</script>
