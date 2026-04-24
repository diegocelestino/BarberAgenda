/**
 * Centralized Error Handling Utility
 * Provides consistent error parsing, formatting, and user-friendly messages
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
  details?: any;
}

/**
 * Parse an error and return a standardized AppError object
 */
export const parseError = (error: any): AppError => {
  // Network errors (no response from server)
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
      originalError: error,
    };
  }

  const statusCode = error.response?.status;
  const serverMessage = error.response?.data?.message || error.response?.data?.error;

  // Authentication errors (401)
  if (statusCode === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: 'Sessão expirada. Por favor, faça login novamente.',
      originalError: error,
      statusCode,
    };
  }

  // Authorization errors (403)
  if (statusCode === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: 'Você não tem permissão para realizar esta ação.',
      originalError: error,
      statusCode,
    };
  }

  // Not found errors (404)
  if (statusCode === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: serverMessage || 'Recurso não encontrado.',
      originalError: error,
      statusCode,
    };
  }

  // Validation errors (400)
  if (statusCode === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: serverMessage || 'Dados inválidos. Verifique os campos e tente novamente.',
      originalError: error,
      statusCode,
      details: error.response?.data?.details,
    };
  }

  // Server errors (500+)
  if (statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'Erro no servidor. Por favor, tente novamente mais tarde.',
      originalError: error,
      statusCode,
    };
  }

  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: serverMessage || error.message || 'Ocorreu um erro inesperado.',
    originalError: error,
    statusCode,
  };
};

/**
 * Get user-friendly error message from any error
 */
export const getErrorMessage = (error: any): string => {
  const appError = parseError(error);
  return appError.message;
};

/**
 * Log error to console (in development) or error tracking service (in production)
 */
export const logError = (error: any, context?: string): void => {
  const appError = parseError(error);
  
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
    console.error('Type:', appError.type);
    console.error('Message:', appError.message);
    console.error('Status Code:', appError.statusCode);
    if (appError.details) {
      console.error('Details:', appError.details);
    }
    console.error('Original Error:', appError.originalError);
    console.groupEnd();
  } else {
    // In production, send to error tracking service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(appError.originalError, { extra: { context, appError } });
    console.error('Error:', appError.message);
  }
};

/**
 * Handle error and return user-friendly message
 * Combines parsing, logging, and message extraction
 */
export const handleError = (error: any, context?: string): string => {
  logError(error, context);
  return getErrorMessage(error);
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error: any, type: ErrorType): boolean => {
  const appError = parseError(error);
  return appError.type === type;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return isErrorType(error, ErrorType.NETWORK);
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return isErrorType(error, ErrorType.AUTHENTICATION);
};

/**
 * Retry function with exponential backoff for network errors
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Only retry on network errors
      if (!isNetworkError(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Common error messages for specific scenarios
 */
export const ErrorMessages = {
  // Network
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  TIMEOUT: 'A requisição demorou muito. Por favor, tente novamente.',
  
  // Authentication
  LOGIN_FAILED: 'Usuário ou senha inválidos.',
  SESSION_EXPIRED: 'Sessão expirada. Por favor, faça login novamente.',
  UNAUTHORIZED: 'Você não tem permissão para realizar esta ação.',
  
  // Validation
  INVALID_PHONE: 'Por favor, insira um número de telefone válido.',
  INVALID_EMAIL: 'Por favor, insira um e-mail válido.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_DATE: 'Data inválida.',
  INVALID_TIME: 'Horário inválido.',
  
  // CRUD Operations
  CREATE_FAILED: 'Erro ao criar. Por favor, tente novamente.',
  UPDATE_FAILED: 'Erro ao atualizar. Por favor, tente novamente.',
  DELETE_FAILED: 'Erro ao excluir. Por favor, tente novamente.',
  FETCH_FAILED: 'Erro ao carregar dados. Por favor, tente novamente.',
  
  // Appointments
  APPOINTMENT_CREATE_FAILED: 'Erro ao criar agendamento. Por favor, tente novamente.',
  APPOINTMENT_UPDATE_FAILED: 'Erro ao atualizar agendamento. Por favor, tente novamente.',
  APPOINTMENT_DELETE_FAILED: 'Erro ao cancelar agendamento. Por favor, tente novamente.',
  SLOT_UNAVAILABLE: 'Este horário não está mais disponível. Por favor, escolha outro.',
  
  // Generic
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Por favor, tente novamente mais tarde.',
};
