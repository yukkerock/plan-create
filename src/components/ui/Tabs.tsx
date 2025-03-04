import React from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  active,
  onClick,
  children,
  className = '',
}) => {
  const activeClass = active
    ? 'bg-white text-gray-900 shadow-sm'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  active,
  children,
  className = '',
}) => {
  if (!active) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};