import { useState, useRef, useEffect } from 'react';

interface SearchSelectProps<T> {
  data: T[];
  isLoading?: boolean;
  value: T | null;
  onChange: (value: T | null) => void;
  onSearch?: (searchTerm: string) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  placeholder?: string;
  disabled?: boolean;
  renderOption?: (item: T) => React.ReactNode;
  noResultsText?: string;
  minSearchLength?: number;
}

function SearchSelect<T>({
  data,
  isLoading = false,
  value,
  onChange,
  onSearch,
  getLabel,
  getKey,
  placeholder = 'Digite para buscar...',
  disabled = false,
  renderOption,
  noResultsText = 'Nenhum resultado encontrado',
  minSearchLength = 2
}: SearchSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger search quando o termo mudar (com debounce)
  useEffect(() => {
    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Se o termo for muito curto, não buscar
    if (searchTerm.length < minSearchLength) {
      return;
    }

    // Criar novo timer
    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        console.log('[SearchSelect] Buscando:', searchTerm);
        onSearch(searchTerm);
      }
    }, 500); // 500ms de debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, onSearch, minSearchLength]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler para selecionar item
  const handleSelect = (item: T) => {
    onChange(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handler para limpar seleção
  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handler para abrir dropdown e focar no input
  const handleOpenSearch = () => {
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input de busca ou valor selecionado */}
      <div className="relative">
        {value ? (
          // Mostrar valor selecionado
          <div className="input input-bordered w-full flex items-center justify-between pr-2">
            <span className="flex-1 truncate">{getLabel(value)}</span>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-ghost btn-xs btn-circle"
                title="Limpar seleção"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          // Mostrar input de busca
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={handleOpenSearch}
            disabled={disabled || isLoading}
          />
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && !value && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : searchTerm.length < minSearchLength ? (
            <div className="p-4 text-center text-base-content text-opacity-60">
              Digite pelo menos {minSearchLength} caracteres para buscar
            </div>
          ) : data.length > 0 ? (
            <ul className="menu p-2">
              {data.map((item) => (
                <li key={getKey(item)}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="text-left"
                  >
                    {renderOption ? renderOption(item) : getLabel(item)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-base-content text-opacity-60">
              {noResultsText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchSelect;
