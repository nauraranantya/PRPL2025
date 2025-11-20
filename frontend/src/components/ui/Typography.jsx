// src/components/ui/Typography.jsx

export const Heading = ({ 
  level = 1, 
  children, 
  className = '',
  as 
}) => {
  const Tag = as || `h${level}`;
  
  const styles = {
    1: 'text-h1',
    2: 'text-h2',
    3: 'text-h3',
    4: 'text-h4',
  };

  return (
    <Tag className={`${styles[level]} ${className}`}>
      {children}
    </Tag>
  );
};

export const Text = ({ 
  size = 'body',
  children, 
  className = '',
  as = 'p',
  color = 'default'
}) => {
  const Tag = as;
  
  const sizes = {
    'body-lg': 'text-body-lg',
    'body': 'text-body',
    'body-sm': 'text-body-sm',
    'caption': 'text-caption',
  };

  const colors = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    light: 'text-gray-500',
  };

  return (
    <Tag className={`${sizes[size]} ${colors[color]} ${className}`}>
      {children}
    </Tag>
  );
};