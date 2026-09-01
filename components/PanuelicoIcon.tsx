// components/PanuelicoIcon.tsx
import React from 'react';

interface PanuelicoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export default function PanuelicoIcon({
  className = 'w-5 h-5',
  size,
  ...props
}: PanuelicoIconProps) {
  const width = size || undefined;
  const height = size || undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      width={width}
      height={height}
      aria-label="Pañuelico rojo de San Fermín"
      {...props}
    >
      {/* Triángulo principal del pañuelo rojo */}
      <path
        d="M2.5 7.5L12 21.5L21.5 7.5C18.5 8.5 15.5 9 12 9C8.5 9 5.5 8.5 2.5 7.5Z"
        fill="#DC2626"
      />
      {/* Pliegue superior / Dobladillo con sombra */}
      <path
        d="M2 7C5 8.5 8.5 9.2 12 9.2C15.5 9.2 19 8.5 22 7L20.5 4.5C17.5 5.8 14.8 6.5 12 6.5C9.2 6.5 6.5 5.8 3.5 4.5L2 7Z"
        fill="#B91C1C"
      />
      {/* Luz y volumen en el triángulo central */}
      <path
        d="M6 8.5L12 18.5L14 11C13.3 10.5 12.7 10 12 9.5C9.8 9.5 7.8 9.1 6 8.5Z"
        fill="#EF4444"
        opacity="0.6"
      />
      {/* Nudo central tradicional */}
      <ellipse
        cx="12"
        cy="6.8"
        rx="2.2"
        ry="1.6"
        fill="#991B1B"
      />
      <circle
        cx="12"
        cy="6.6"
        r="1.2"
        fill="#DC2626"
      />
    </svg>
  );
}
