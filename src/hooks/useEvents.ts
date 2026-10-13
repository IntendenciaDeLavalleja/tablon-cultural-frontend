import { useQuery, useMutation } from '@tanstack/react-query';
import { getEvents, submitEvent } from '../api/events';
import type { EventFormData } from '../components/sections/formSchemas';

export const useEvents = (showAll = false) => {
  return useQuery({
    queryKey: ['events', { showAll }],
    queryFn: () => getEvents(showAll),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useSubmitEvent = () => {
  return useMutation({
    mutationFn: ({ data, key }: { data: EventFormData; key: string }) => submitEvent(data, key),
    retry: false,
  });
};
