import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI } from '../api/client';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ username, password }) => authAPI.login(username, password),
    onSuccess: (response) => {
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authAPI.getCurrentUser();
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });
};

export const useLogout = () => {
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
};
