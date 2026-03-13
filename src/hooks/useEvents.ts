import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, submitEvent } from '../api/events';
import type { EventFormData } from '../components/sections/formSchemas';

export const useEvents = (showAll = false) => {
  return useQuery({
    queryKey: ['events', { showAll }],
    queryFn: () => getEvents(showAll),
  });
};

export const useSubmitEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventFormData) => submitEvent(data),
    onSuccess: () => {
      // Invalidate events list if needed (though submissions go to admin review)
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
