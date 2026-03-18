import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingAPI } from '../api/client';

export const useBillingInvoices = (params = {}) => {
  return useQuery({
    queryKey: ['billing', params],
    queryFn: async () => {
      const response = await billingAPI.list(params);
      return response.data;
    },
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await billingAPI.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount }) => billingAPI.recordPayment(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
};

export const useDownloadInvoicePDF = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await billingAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};
