import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../api/client';

export const useScheduleMaster = (startDate, endDate) => {
  return useQuery({
    queryKey: ['scheduleMaster', startDate, endDate],
    queryFn: async () => {
      const response = await reportsAPI.scheduleMaster(startDate, endDate);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useFinanceMaster = () => {
  return useQuery({
    queryKey: ['financeMaster'],
    queryFn: async () => {
      const response = await reportsAPI.financeMaster();
      return response.data;
    },
  });
};

export const useAuthMaster = () => {
  return useQuery({
    queryKey: ['authMaster'],
    queryFn: async () => {
      const response = await reportsAPI.authMaster();
      return response.data;
    },
  });
};

export const useProviderPerformance = (startDate, endDate) => {
  return useQuery({
    queryKey: ['providerPerformance', startDate, endDate],
    queryFn: async () => {
      const response = await reportsAPI.providerPerformance(startDate, endDate);
      return response.data;
    },
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await reportsAPI.dashboardSummary();
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
