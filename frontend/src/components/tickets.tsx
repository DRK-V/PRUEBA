import React from 'react';

interface TableRow {
  numero: number;
  fecha: string;
  ultimaActualizacion: string;
  cantidad: string;
}

const TableComponent = () => {
  const data: TableRow[] = Array.from({ length: 12 }, (_, i) => ({
    numero: i + 1,
    fecha: '4/11/2011',
    ultimaActualizacion: '4/11/2011',
    cantidad: 'Divareas S.A.S',
  }));

  return (
    <div className="w-full max-w-6xl mx-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-green-600 text-white p-3 border border-gray-300">
              fecha de solicitud
            </th>
            <th className="bg-green-600 text-white p-3 border border-gray-300">
              descripcion del producto
            </th>
            <th className="bg-green-600 text-white p-3 border border-gray-300">
              cantidad 
            </th>
            <th className="bg-green-600 text-white p-3 border border-gray-300">
              fecha de entrega
            </th>
            <th className="bg-green-600 text-white p-3 border border-gray-300">
              ACCIONES
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.numero} className="hover:bg-gray-50">
              <td className="p-3 border border-gray-300">{row.numero}</td>
              <td className="p-3 border border-gray-300">{row.fecha}</td>
              <td className="p-3 border border-gray-300">{row.ultimaActualizacion}</td>
              <td className="p-3 border border-gray-300">{row.cantidad}</td>
              <td className="p-3 border border-gray-300">
                <button className="bg-green-500 text-white p-2 rounded-md">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;