import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Document } from '../types/crm';

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (
    file: File,
    metadata: { title: string; description?: string }
  ) => Promise<void>;
  deleteDocument: (id: string, filePath: string) => Promise<void>;
  searchDocuments: (query: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  loading: false,
  error: null,
  fetchDocuments: async () => {
    set({ loading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ documents: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  uploadDocument: async (file: File, metadata: { title: string; description?: string }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert([{
          title: metadata.title,
          description: metadata.description,
          file_url: publicUrl,
          file_type: file.type,
          shared_by: userData.user.id,
        }])
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      set((state) => ({
        documents: [data, ...state.documents],
        error: null,
      }));

      // Create notification for document upload
      await supabase
        .from('notifications')
        .insert([{
          title: 'New Document Uploaded',
          message: `${metadata.title} has been uploaded to the document library`,
          recipient_id: userData.user.id,
          created_by: userData.user.id,
        }]);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  deleteDocument: async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
  searchDocuments: async (query: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ documents: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));