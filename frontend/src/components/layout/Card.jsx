// src/components/layout/Card.jsx
export const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    flat: 'bg-gray-50'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};