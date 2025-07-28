import { Search, X } from "lucide-react";

interface SearchFilterProps {
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    placeholder?: string;
  }
  
  const SearchFilter: React.FC<SearchFilterProps> = ({
    globalFilter,
    setGlobalFilter,
    placeholder = "ค้นหา..."
  }) => {
    return (
      <div className="relative w-[500px] border border-gray-300 focus-within:outline-regal-blue rounded-lg transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 pr-4 py-1 w-full  bg-[#FAFAFA] rounded-md focus:ring-2 focus:ring-regal-blue focus:border-transparent outline-none"
          placeholder={placeholder}
        />
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };
  
  export default SearchFilter;