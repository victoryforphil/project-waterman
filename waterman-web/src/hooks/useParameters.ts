import { useState, useCallback } from 'react';
import { 
  Parameters, 
  DataVolumeParams, 
  DataCharacteristicsParams, 
  WebSocketParams,
  ServerStatus
} from '../types/parameters';

interface UseParametersOptions {
  baseUrl?: string;
}

interface UseParametersReturn {
  parameters: Parameters | null;
  dataVolumeParams: DataVolumeParams | null;
  dataCharacteristicsParams: DataCharacteristicsParams | null;
  webSocketParams: WebSocketParams | null;
  serverStatus: ServerStatus | null;
  loading: boolean;
  error: string | null;
  fetchParameters: () => Promise<void>;
  fetchDataVolumeParams: () => Promise<void>;
  fetchDataCharacteristicsParams: () => Promise<void>;
  fetchWebSocketParams: () => Promise<void>;
  fetchServerStatus: () => Promise<void>;
  updateParameters: (params: Parameters) => Promise<void>;
  updateDataVolumeParams: (params: DataVolumeParams) => Promise<void>;
  updateDataCharacteristicsParams: (params: DataCharacteristicsParams) => Promise<void>;
  updateWebSocketParams: (params: WebSocketParams) => Promise<void>;
}

export function useParameters(options: UseParametersOptions = {}): UseParametersReturn {
  const { baseUrl = 'http://localhost:3031' } = options;
  
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [dataVolumeParams, setDataVolumeParams] = useState<DataVolumeParams | null>(null);
  const [dataCharacteristicsParams, setDataCharacteristicsParams] = useState<DataCharacteristicsParams | null>(null);
  const [webSocketParams, setWebSocketParams] = useState<WebSocketParams | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithErrorHandling = useCallback(async <T,>(
    url: string, 
    options?: RequestInit
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParameters = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<Parameters>(`${baseUrl}/parameters`);
      setParameters(data);
    } catch (err) {
      console.error('Failed to fetch parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const fetchDataVolumeParams = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<DataVolumeParams>(`${baseUrl}/parameters/data_volume`);
      setDataVolumeParams(data);
    } catch (err) {
      console.error('Failed to fetch data volume parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const fetchDataCharacteristicsParams = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<DataCharacteristicsParams>(
        `${baseUrl}/parameters/data_characteristics`
      );
      setDataCharacteristicsParams(data);
    } catch (err) {
      console.error('Failed to fetch data characteristics parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const fetchWebSocketParams = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<WebSocketParams>(`${baseUrl}/parameters/websocket`);
      setWebSocketParams(data);
    } catch (err) {
      console.error('Failed to fetch websocket parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const fetchServerStatus = useCallback(async () => {
    try {
      const data = await fetchWithErrorHandling<ServerStatus>(`${baseUrl}/status`);
      setServerStatus(data);
    } catch (err) {
      console.error('Failed to fetch server status:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const updateParameters = useCallback(async (params: Parameters) => {
    try {
      const data = await fetchWithErrorHandling<Parameters>(`${baseUrl}/parameters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      setParameters(data);
    } catch (err) {
      console.error('Failed to update parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const updateDataVolumeParams = useCallback(async (params: DataVolumeParams) => {
    try {
      await fetchWithErrorHandling<any>(`${baseUrl}/parameters/data_volume`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      setDataVolumeParams(params);
    } catch (err) {
      console.error('Failed to update data volume parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const updateDataCharacteristicsParams = useCallback(async (params: DataCharacteristicsParams) => {
    try {
      await fetchWithErrorHandling<any>(`${baseUrl}/parameters/data_characteristics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      setDataCharacteristicsParams(params);
    } catch (err) {
      console.error('Failed to update data characteristics parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  const updateWebSocketParams = useCallback(async (params: WebSocketParams) => {
    try {
      await fetchWithErrorHandling<any>(`${baseUrl}/parameters/websocket`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      setWebSocketParams(params);
    } catch (err) {
      console.error('Failed to update websocket parameters:', err);
    }
  }, [baseUrl, fetchWithErrorHandling]);

  return {
    parameters,
    dataVolumeParams,
    dataCharacteristicsParams,
    webSocketParams,
    serverStatus,
    loading,
    error,
    fetchParameters,
    fetchDataVolumeParams,
    fetchDataCharacteristicsParams,
    fetchWebSocketParams,
    fetchServerStatus,
    updateParameters,
    updateDataVolumeParams,
    updateDataCharacteristicsParams,
    updateWebSocketParams,
  };
} 