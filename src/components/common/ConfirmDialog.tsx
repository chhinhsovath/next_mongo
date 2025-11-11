'use client';

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface ConfirmDialogOptions {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger' | 'default';
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Standardized confirmation dialog for destructive actions
 */
export const showConfirmDialog = ({
  title,
  content,
  okText = 'Confirm',
  cancelText = 'Cancel',
  okType = 'danger',
  onOk,
  onCancel,
}: ConfirmDialogOptions) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText,
    cancelText,
    okType,
    onOk,
    onCancel,
    centered: true,
  });
};

/**
 * Pre-configured delete confirmation dialog
 */
export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: `Delete ${itemName}`,
    content: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
    okText: 'Delete',
    okType: 'danger',
    onOk: onConfirm,
  });
};

/**
 * Pre-configured cancel confirmation dialog
 */
export const showCancelConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: `Cancel ${itemName}`,
    content: `Are you sure you want to cancel this ${itemName.toLowerCase()}?`,
    okText: 'Yes, Cancel',
    okType: 'danger',
    onOk: onConfirm,
  });
};

/**
 * Pre-configured approve confirmation dialog
 */
export const showApproveConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: `Approve ${itemName}`,
    content: `Are you sure you want to approve this ${itemName.toLowerCase()}?`,
    okText: 'Approve',
    okType: 'primary',
    onOk: onConfirm,
  });
};

/**
 * Pre-configured reject confirmation dialog
 */
export const showRejectConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: `Reject ${itemName}`,
    content: `Are you sure you want to reject this ${itemName.toLowerCase()}?`,
    okText: 'Reject',
    okType: 'danger',
    onOk: onConfirm,
  });
};
