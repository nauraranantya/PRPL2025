// src/components/layout/Container.jsx
export const Container = ({ children, size = 'default', className = '' }) => {
  const sizeClasses = {
    narrow: 'max-w-narrow',
    default: 'max-w-content',
    wide: 'max-w-container',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};