import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI } from '../api/client';

export const useAppointments = (params = {}) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const response = await appointmentsAPI.list(params);
      return response.data;
    },
  });
};

export const useAppointment = (id) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await appointmentsAPI.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => appointmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useAuthorizeAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, authCode }) => appointmentsAPI.authorize(id, authCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => appointmentsAPI.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
  });
};
