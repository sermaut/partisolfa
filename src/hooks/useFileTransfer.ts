import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (progress: number) => void;
}

interface DownloadOptions {
  bucket: string;
  path: string;
  fileName: string;
}

export function useFileTransfer() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  const uploadFile = useCallback(async ({ bucket, path, file, onProgress }: UploadOptions): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentOperation(file.name);
    
    try {
      // Simulate progress for better UX (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      
      if (error) throw error;
      
      setUploadProgress(100);
      onProgress?.(100);
      
      return data.path;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível enviar o ficheiro.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
      setCurrentOperation(null);
    }
  }, [toast]);

  const uploadMultipleFiles = useCallback(async (
    bucket: string,
    files: Array<{ file: File; path: string }>,
    onFileComplete?: (index: number, total: number) => void
  ): Promise<string[]> => {
    setIsUploading(true);
    const uploadedPaths: string[] = [];
    
    try {
      // Upload files in parallel with a concurrency limit
      const concurrencyLimit = 3;
      const chunks: Array<Array<{ file: File; path: string; index: number }>> = [];
      
      const filesWithIndex = files.map((f, i) => ({ ...f, index: i }));
      
      for (let i = 0; i < filesWithIndex.length; i += concurrencyLimit) {
        chunks.push(filesWithIndex.slice(i, i + concurrencyLimit));
      }

      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map(async ({ file, path, index }) => {
            setCurrentOperation(file.name);
            
            const { data, error } = await supabase.storage
              .from(bucket)
              .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (error) {
              console.error(`Error uploading ${file.name}:`, error);
              return null;
            }

            onFileComplete?.(index + 1, files.length);
            return data.path;
          })
        );

        uploadedPaths.push(...results.filter((p): p is string => p !== null));
      }

      return uploadedPaths;
    } catch (error) {
      console.error('Multiple upload error:', error);
      return uploadedPaths;
    } finally {
      setIsUploading(false);
      setCurrentOperation(null);
    }
  }, []);

  const downloadFile = useCallback(async ({ bucket, path, fileName }: DownloadOptions): Promise<boolean> => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setCurrentOperation(fileName);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 15, 85));
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      clearInterval(progressInterval);
      
      if (error) throw error;
      
      setDownloadProgress(95);

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadProgress(100);
      return true;
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Erro no download',
        description: error.message || 'Não foi possível descarregar o ficheiro.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDownloading(false);
      setCurrentOperation(null);
    }
  }, [toast]);

  const getSignedUrl = useCallback(async (bucket: string, path: string, expiresIn = 3600): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }, []);

  const deleteFile = useCallback(async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Erro ao eliminar',
        description: error.message || 'Não foi possível eliminar o ficheiro.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    uploadFile,
    uploadMultipleFiles,
    downloadFile,
    deleteFile,
    getSignedUrl,
    isUploading,
    isDownloading,
    uploadProgress,
    downloadProgress,
    currentOperation,
  };
}
