// src/components/layout/Section.jsx
export const Section = ({ children, spacing = 'default', className = '' }) => {
  const spacingClasses = {
    sm: 'py-section-sm',
    default: 'py-section',
    lg: 'py-section-lg',
    none: ''
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  );
};