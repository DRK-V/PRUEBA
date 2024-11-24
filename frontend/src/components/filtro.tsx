import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';

interface FilterProps {
  filterType: 'admin' | 'aux'; // Determine which filter type
}

const Filter: React.FC<FilterProps> = ({ filterType }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const toggleFilter = () => setIsVisible(!isVisible);

  return (
    <>
      <button
        onClick={toggleFilter}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        aria-label="Toggle filter"
      >
        Filtrar
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full m-4">
            <h2 className="text-2xl font-bold text-center mb-6">Filtrar</h2>

            <div className="space-y-4">
              <div className="relative">
                <button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex justify-between items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{filterType === 'admin' ? 'Ubicación' : 'Estante'}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute w-full bg-white border rounded-lg mt-1 shadow-lg z-10">
                    {/* Add location/estante options here based on filter type */}
                    {filterType === 'admin' ? (
                      <>
                        <div className="p-2">Ubicación 1</div>
                        <div className="p-2">Ubicación 2</div>
                      </>
                    ) : (
                      <>
                        <div className="p-2">Estante A</div>
                        <div className="p-2">Estante B</div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700">Fecha Creación Desde</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <FontAwesomeIcon 
                    icon={faCalendarAlt} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700">Fecha Creación Hasta</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                  <FontAwesomeIcon 
                    icon={faCalendarAlt} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  onClick={() => {
                    console.log('Filter saved');
                    setIsVisible(false);
                  }}
                >
                  Guardar
                </button>
                <button 
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  onClick={() => setIsVisible(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Filter;
