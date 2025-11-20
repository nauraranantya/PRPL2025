export const PageHeader = ({ title, description, actions, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-h1 text-[#043873]">{title}</h1>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
      {description && (
        <p className="text-body-lg text-gray-600 max-w-3xl">{description}</p>
      )}
    </div>
  );
};
