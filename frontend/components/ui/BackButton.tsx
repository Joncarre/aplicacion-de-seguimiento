'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export default function BackButton({ href, onClick, label = 'Volver' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2"
      aria-label={label}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </Button>
  );
}
