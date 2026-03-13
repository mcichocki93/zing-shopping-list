import { useState, useCallback, useEffect } from 'react';
import { saveTemplate, getTemplates, deleteTemplate } from '../../../services/firebase/templates';
import { useAuth } from '../../auth/hooks';
import type { ListTemplate, TemplateItem } from '../../../types/template';

export function useTemplates({ load = true }: { load?: boolean } = {}) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTemplates(user.id);
      setTemplates(data);
    } catch {
      setError('Nie udało się załadować szablonów.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (load) reload();
  }, [load, reload]);

  const handleSave = useCallback(async (name: string, items: TemplateItem[]): Promise<string | null> => {
    if (!user) return null;
    try {
      const id = await saveTemplate(user.id, name, items);
      return id;
    } catch {
      setError('Nie udało się zapisać szablonu.');
      return null;
    }
  }, [user]);

  const handleDelete = useCallback(async (templateId: string): Promise<void> => {
    if (!user) return;
    try {
      await deleteTemplate(user.id, templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch {
      setError('Nie udało się usunąć szablonu.');
    }
  }, [user]);

  return { templates, isLoading, error, handleSave, handleDelete, reload };
}
