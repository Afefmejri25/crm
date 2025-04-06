import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types/crm';
import { formatDistanceToNow } from 'date-fns';

interface DocumentFormData {
  title: string;
  description: string;
  file: File | null;
}

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    try {
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          title: formData.title,
          description: formData.description,
          file_url: publicUrl,
          file_type: formData.file.type,
        }]);

      if (dbError) throw dbError;

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        file: null,
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Documents</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getFileIcon(document.file_type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{document.title}</h3>
                  {document.description && (
                    <p className="text-sm text-gray-600">{document.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                Uploaded {formatDistanceToNow(new Date(document.created_at))} ago
              </span>
              <div className="flex space-x-2">
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </a>
                <a
                  href={document.file_url}
                  download
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Document</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}