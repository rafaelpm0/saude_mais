import { api } from '../api';

// Exemplo de endpoint - substitua pelos endpoints do seu projeto
export const exampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Exemplo de query
    getItems: builder.query<any[], void>({
      query: () => 'items',
      // Sem cache para aplicação de aula
    }),
    
    // Exemplo de mutation  
    createItem: builder.mutation<any, Partial<any>>({
      query: (newItem) => ({
        url: 'items',
        method: 'POST',
        body: newItem,
      }),
      // Sem cache para aplicação de aula
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useGetItemsQuery,
  useCreateItemMutation,
} = exampleApi;