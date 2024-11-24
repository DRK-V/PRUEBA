import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Download_admin = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterLocation, filterStartDate, filterEndDate]);

  const fetchInventoryData = async () => {
    const response = await fetch('http://localhost:3000/api/inventarioadmin');
    const result = await response.json();
    setInventoryData(result.data);
    setFilteredData(result.data);
  };

  const applyFilters = () => {
    let data = inventoryData;

    // Filtro por ubicación
    if (filterLocation) {
      data = data.filter(item =>
        item.ubicacion.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Filtro por rango de fechas (fecha inicial y fecha final)
    if (filterStartDate && filterEndDate) {
      const startDate = new Date(filterStartDate);
      const endDate = new Date(filterEndDate);
      endDate.setDate(endDate.getDate() + 1); // Avanzar al día siguiente para incluir hasta las 23:59

      data = data.filter(item => {
        const itemDate = new Date(item.fecha_creacion);
        return itemDate >= startDate && itemDate < endDate;
      });
    } 
    // Filtro solo por fecha inicial
    else if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // Avanzar al día siguiente para incluir hasta las 23:59

      data = data.filter(item => {
        const itemDate = new Date(item.fecha_creacion);
        return itemDate >= startDate && itemDate < endDate;
      });
    } 
    // Filtro solo por fecha final
    else if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setDate(endDate.getDate() + 1); // Avanzar al día siguiente para incluir hasta las 23:59

      data = data.filter(item => {
        const itemDate = new Date(item.fecha_creacion);
        return itemDate < endDate;
      });
    }

    setFilteredData(data);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
    XLSX.writeFile(workbook, 'inventario.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.text('Inventario', 14, 10);

    const tableData = filteredData.map(item => [
      item.id,
      item.item,
      item.descripcion,
      item.proveedor,
      item.ubicacion,
      item.estado,
      new Date(item.fecha_creacion).toLocaleString(),
    ]);

    doc.autoTable({
      head: [['ID', 'ITEM', 'DESCRIPCIÓN', 'PROVEEDOR', 'UBICACIÓN', 'ESTADO', 'FECHA CREACIÓN']],
      body: tableData,
      startY: 20,
    });

    doc.save('inventario.pdf');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Barra de filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por ubicación"
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          className="border px-4 py-2 rounded-md"
        />
        <input
          type="date"
          value={filterStartDate}
          onChange={e => setFilterStartDate(e.target.value)}
          className="border px-4 py-2 rounded-md"
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
          className="border px-4 py-2 rounded-md"
        />
      </div>

      {/* Botones de descarga */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleDownloadExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <i className="fas fa-file-excel"></i> Descargar Excel
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <i className="fas fa-file-pdf"></i> Descargar PDF
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ITEM</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">DESCRIPCIÓN</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">PROVEEDOR</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">UBICACIÓN</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ESTADO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">FECHA CREACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">{item.item}</td>
                <td className="px-6 py-4">{item.descripcion}</td>
                <td className="px-6 py-4">{item.proveedor}</td>
                <td className="px-6 py-4">{item.ubicacion}</td>
                <td className="px-6 py-4">{item.estado}</td>
                <td className="px-6 py-4">
                  {new Date(item.fecha_creacion).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Download_admin;
