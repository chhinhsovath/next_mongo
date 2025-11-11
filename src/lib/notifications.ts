'use client';

import { message, notification } from 'antd';
import { getErrorMessage, Language } from './errorMessages';

/**
 * Show success notification
 */
export function showSuccess(
  title: string,
  description?: string,
  duration: number = 3
) {
  notification.success({
    message: title,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * Show error notification
 */
export function showError(
  title: string,
  description?: string,
  duration: number = 5
) {
  notification.error({
    message: title,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * Show warning notification
 */
export function showWarning(
  title: string,
  description?: string,
  duration: number = 4
) {
  notification.warning({
    message: title,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * Show info notification
 */
export function showInfo(
  title: string,
  description?: string,
  duration: number = 3
) {
  notification.info({
    message: title,
    description,
    duration,
    placement: 'topRight',
  });
}

/**
 * Show API error notification with localized message
 */
export function showApiError(
  errorCode?: string,
  errorMessage?: string,
  language: Language = 'en'
) {
  const localizedMessage = errorCode 
    ? getErrorMessage(errorCode, language)
    : errorMessage || getErrorMessage('UNKNOWN_ERROR', language);

  notification.error({
    message: language === 'km' ? 'កំហុស' : 'Error',
    description: localizedMessage,
    duration: 5,
    placement: 'topRight',
  });
}

/**
 * Show success message (toast)
 */
export function showSuccessMessage(
  content: string,
  duration: number = 2
) {
  message.success(content, duration);
}

/**
 * Show error message (toast)
 */
export function showErrorMessage(
  content: string,
  duration: number = 3
) {
  message.error(content, duration);
}

/**
 * Show warning message (toast)
 */
export function showWarningMessage(
  content: string,
  duration: number = 2.5
) {
  message.warning(content, duration);
}

/**
 * Show info message (toast)
 */
export function showInfoMessage(
  content: string,
  duration: number = 2
) {
  message.info(content, duration);
}

/**
 * Show loading message (toast)
 */
export function showLoadingMessage(
  content: string = 'Loading...',
  duration: number = 0
) {
  return message.loading(content, duration);
}

/**
 * Destroy all messages
 */
export function destroyAllMessages() {
  message.destroy();
}

/**
 * Destroy all notifications
 */
export function destroyAllNotifications() {
  notification.destroy();
}
