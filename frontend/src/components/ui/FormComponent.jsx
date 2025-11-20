// src/components/ui/Form.jsx

export const FormGroup = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

export const Label = ({ children, required, htmlFor, className = '' }) => (
  <label 
    htmlFor={htmlFor}
    className={`block text-body-sm font-medium text-gray-700 mb-2 ${className}`}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const Input = ({ 
  error, 
  helperText,
  className = '',
  ...props 
}) => (
  <div>
    <input
      className={`
        w-full px-4 py-2.5 text-body
        border rounded-lg
        ${error ? 'border-red-500' : 'border-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-body-sm text-red-600">{error}</p>
    )}
    {helperText && !error && (
      <p className="mt-1.5 text-body-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

export const TextArea = ({ 
  error, 
  helperText,
  rows = 4,
  className = '',
  ...props 
}) => (
  <div>
    <textarea
      rows={rows}
      className={`
        w-full px-4 py-2.5 text-body
        border rounded-lg
        ${error ? 'border-red-500' : 'border-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        resize-vertical
        ${className}
      `}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-body-sm text-red-600">{error}</p>
    )}
    {helperText && !error && (
      <p className="mt-1.5 text-body-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

export const Select = ({ 
  options = [],
  error,
  helperText,
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => (
  <div>
    <select
      className={`
        w-full px-4 py-2.5 text-body
        border rounded-lg
        ${error ? 'border-red-500' : 'border-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1.5 text-body-sm text-red-600">{error}</p>
    )}
    {helperText && !error && (
      <p className="mt-1.5 text-body-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

// Example usage:
/*
<FormGroup>
  <Label htmlFor="title" required>Event Title</Label>
  <Input
    id="title"
    value={formData.title}
    onChange={(e) => setFormData({...formData, title: e.target.value})}
    error={errors.title}
    placeholder="Enter event title"
  />
</FormGroup>
*/