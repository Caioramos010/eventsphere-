import { useState, useEffect, useCallback } from 'react';
import { handleServiceError } from '../utils/errorHandler';

export const useApiCall = (apiFunction, options = {}) => {
  const {
    immediate = false,
    defaultData = null,
    onSuccess = null,
    onError = null,
    deps = []
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await apiFunction(...args);

      if (result.success) {
        setData(result.data || result);
        setSuccess(true);
        if (onSuccess) onSuccess(result);
        return result;
      } else {
        const errorResult = handleServiceError(
          new Error(result.message || 'API call failed'),
          'useApiCall'
        );
        setError(errorResult.message);
        if (onError) onError(errorResult);
        return errorResult;
      }
    } catch (err) {
      const errorResult = handleServiceError(err, 'useApiCall');
      setError(errorResult.message);
      if (onError) onError(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(defaultData);
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, [defaultData]);

  const setApiError = useCallback((errorMessage) => {
    setError(errorMessage);
    setSuccess(false);
  }, []);

  const setApiSuccess = useCallback((successData) => {
    setData(successData);
    setSuccess(true);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...deps]);

  return {
    data,
    loading,
    error,
    success,
    execute,
    reset,
    setError: setApiError,
    setSuccess: setApiSuccess,
    setData
  };
};

export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    pageSize = 10,
    immediate = false,
    onSuccess = null,
    onError = null
  } = options;

  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const {
    loading,
    error,
    execute: executeApi,
    setError,
    reset: resetApi
  } = useApiCall(apiFunction, {
    immediate: false,
    onSuccess: (result) => {
      const data = result.data || result;
      setItems(data.items || data.content || data);
      setTotalPages(data.totalPages || Math.ceil(data.total / pageSize));
      setTotalItems(data.total || data.totalElements || 0);
      setHasMore(currentPage < (data.totalPages || 1));
      if (onSuccess) onSuccess(result);
    },
    onError
  });

  const loadPage = useCallback(async (page = 1) => {
    setCurrentPage(page);
    return executeApi({ page, size: pageSize });
  }, [executeApi, pageSize]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      const result = await executeApi({ page: nextPage, size: pageSize });
      
      if (result.success) {
        setCurrentPage(nextPage);
        const newData = result.data || result;
        setItems(prev => [...prev, ...(newData.items || newData.content || newData)]);
      }
      
      return result;
    }
  }, [hasMore, loading, currentPage, executeApi, pageSize]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalItems(0);
    setHasMore(false);
    resetApi();
  }, [resetApi]);

  const refresh = useCallback(() => {
    return loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    if (immediate) {
      loadPage(1);
    }
  }, [immediate, loadPage]);

  return {
    items,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    loadPage,
    loadMore,
    reset,
    refresh,
    setError
  };
};

export const useListCrud = (services, options = {}) => {
  const {
    immediate = false,
    onSuccess = null,
    onError = null
  } = options;

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    loading: listLoading,
    error: listError,
    execute: loadList
  } = useApiCall(services.list, {
    immediate,
    onSuccess: (result) => {
      const data = result.data || result;
      setItems(Array.isArray(data) ? data : data.items || []);
      if (onSuccess) onSuccess(result);
    },
    onError
  });

  const {
    loading: actionLoading,
    error: actionError,
    execute: executeAction
  } = useApiCall(async () => {}, { immediate: false });

  const createItem = useCallback(async (itemData) => {
    if (!services.create) return;
    
    const result = await executeAction(() => services.create(itemData));
    if (result.success) {
      setItems(prev => [...prev, result.data || result]);
    }
    return result;
  }, [services.create, executeAction]);

  const updateItem = useCallback(async (id, itemData) => {
    if (!services.update) return;
    
    const result = await executeAction(() => services.update(id, itemData));
    if (result.success) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...(result.data || itemData) } : item
      ));
    }
    return result;
  }, [services.update, executeAction]);

  const deleteItem = useCallback(async (id) => {
    if (!services.delete) return;
    
    const result = await executeAction(() => services.delete(id));
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
    return result;
  }, [services.delete, executeAction, selectedItem]);

  const refresh = useCallback(() => {
    return loadList();
  }, [loadList]);

  const selectItem = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    items,
    selectedItem,
    loading: listLoading || actionLoading,
    error: listError || actionError,
    createItem,
    updateItem,
    deleteItem,
    refresh,
    selectItem,
    clearSelection,
    setItems
  };
};
