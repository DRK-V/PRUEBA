import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Download_aux = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterModulo, setFilterModulo] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterModulo, filterStartDate, filterEndDate]);

  const fetchInventoryData = async () => {
    const response = await fetch('http://localhost:3000/api/inventario');
    const result = await response.json();
    setInventoryData(result.data);
    setFilteredData(result.data);
  };

  const applyFilters = () => {
    let data = inventoryData;

    // Filtro por módulo
    if (filterModulo) {
      data = data.filter(item =>
        item.modulo.toLowerCase().includes(filterModulo.toLowerCase())
      );
    }

    // Filtro por rango de fechas
    if (filterStartDate && filterEndDate) {
      const startDate = new Date(filterStartDate);
      const endDate = new Date(filterEndDate);
      endDate.setDate(endDate.getDate() + 1);

      data = data.filter(item => {
        const itemDate = new Date(item.fecha_creacion);
        return itemDate >= startDate && itemDate < endDate;
      });
    } 
    else if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      data = data.filter(item => {
        const itemDate = new Date(item.fecha_creacion);
        return itemDate >= startDate && itemDate < endDate;
      });
    } 
    else if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setDate(endDate.getDate() + 1);

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
      item.modulo,
      item.estante,
      item.cantidad,
      item.producto_detalle,
      item.estado,
      item.entrada,
      item.salida,
      item.restante,
      new Date(item.fecha_creacion).toLocaleString(),
    ]);

    doc.autoTable({
      head: [['ID', 'MÓDULO', 'ESTANTE', 'CANTIDAD', 'PRODUCTO', 'ESTADO', 'ENTRADA', 'SALIDA', 'RESTANTE', 'FECHA CREACIÓN']],
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
          placeholder="Filtrar por módulo"
          value={filterModulo}
          onChange={e => setFilterModulo(e.target.value)}
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">MÓDULO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ESTANTE</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">CANTIDAD</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">PRODUCTO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ESTADO</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ENTRADA</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">SALIDA</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">RESTANTE</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">FECHA CREACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">{item.modulo}</td>
                <td className="px-6 py-4">{item.estante}</td>
                <td className="px-6 py-4">{item.cantidad}</td>
                <td className="px-6 py-4">{item.producto_detalle}</td>
                <td className="px-6 py-4">{item.estado}</td>
                <td className="px-6 py-4">{item.entrada}</td>
                <td className="px-6 py-4">{item.salida}</td>
                <td className="px-6 py-4">{item.restante}</td>
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

export default Download_aux;