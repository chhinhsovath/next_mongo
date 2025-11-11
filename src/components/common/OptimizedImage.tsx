'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  shape?: 'circle' | 'square';
}

/**
 * Optimized image component using Next.js Image
 * Falls back to Avatar with icon if image fails to load
 */
export default function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
  priority = false,
  shape = 'circle',
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);

  // If no src or image failed to load, show avatar with icon
  if (!src || imageError) {
    return (
      <Avatar
        size={width}
        icon={<UserOutlined />}
        shape={shape}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: shape === 'circle' ? '50%' : '8px',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${width}px`}
        style={{
          objectFit: 'cover',
        }}
        priority={priority}
        onError={() => setImageError(true)}
        quality={85}
      />
    </div>
  );
}
