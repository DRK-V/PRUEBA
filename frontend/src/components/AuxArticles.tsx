import React, { useState, useEffect } from 'react';
import { useArticlesContext } from './ArticlesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faPrint, faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

export function AuxArticles() {
  const { activeTab, setActiveTab } = useArticlesContext();
  const [auxData, setAuxData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [newRows, setNewRows] = useState([{ item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);

  const [estanteFilter, setEstanteFilter] = useState('');
  const [productoDetalleFilter, setProductoDetalleFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/inventario');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const sortedData = data.data.sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return idA - idB;
      });
      setAuxData(sortedData);
      setFilteredData(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filteredResults = auxData.filter((item) => {
      const itemFecha = new Date(item.fecha_creacion);

      const matchesEstante = estanteFilter
        ? item.estante.toLowerCase().includes(estanteFilter.toLowerCase())
        : true;

      const matchesProductoDetalle = productoDetalleFilter
        ? item.producto_detalle.toLowerCase().includes(productoDetalleFilter.toLowerCase())
        : true;

      const matchesFechaDesde = fechaDesde
        ? itemFecha >= new Date(`${fechaDesde}T00:00:00`)
        : true;

      const matchesFechaHasta = fechaHasta
        ? itemFecha <= new Date(`${fechaHasta}T23:59:59`)
        : true;

      if (fechaDesde && !fechaHasta) {
        const startOfDay = new Date(`${fechaDesde}T00:00:00`);
        const endOfDay = new Date(`${fechaDesde}T23:59:59`);
        return (
          matchesEstante &&
          matchesProductoDetalle &&
          itemFecha >= startOfDay &&
          itemFecha <= endOfDay
        );
      }

      return (
        matchesEstante &&
        matchesProductoDetalle &&
        matchesFechaDesde &&
        matchesFechaHasta
      );
    });

    setFilteredData(filteredResults);
  }, [estanteFilter, productoDetalleFilter, fechaDesde, fechaHasta, auxData]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewRows([{ item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);
  };

  const addRow = () => {
    setNewRows([...newRows, { item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...newRows];
    updatedRows[index][field] = value;
    setNewRows(updatedRows);
  };

  const saveArticles = async () => {
    try {
      // Prepare the data to be sent. Only include non-empty fields
      const filteredRows = newRows.map((row) => {
        const filteredRow = {};
        if (row.modulo) filteredRow.modulo = row.modulo;
        if (row.estante) filteredRow.estante = row.estante;
        if (row.cantidad) filteredRow.cantidad = row.cantidad;
        if (row.producto_detalle) filteredRow.producto_detalle = row.producto_detalle;
        if (row.estado) filteredRow.estado = row.estado;
        if (row.entrada) filteredRow.entrada = row.entrada;
        return filteredRow;
      });

      // Send each row to the backend
      for (const row of filteredRows) {
        const response = await fetch('http://localhost:3000/api/addInventoryItem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Artículo agregado:', result);
      }

      // Refresh the data after adding articles
      await fetchData();  // Fetch the latest data from the API

      // Close the modal after saving
      closeModal();
    } catch (error) {
      console.error('Error al guardar artículos:', error);
    }
  };
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // ... (previous functions remain the same until handleEditClick)

  const handleEditClick = (item) => {
    setEditingRow({
      modulo: item.modulo || '',
      estante: item.estante || '',
      cantidad: item.cantidad || '',
      producto_detalle: item.producto_detalle || '',
      estado: item.estado || '',
      entrada: item.entrada || '',
      id: item.id
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingRow(null);
  };

  const handleEditChange = (field, value) => {
    setEditingRow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEditedArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/inventory_update/${editingRow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRow),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Artículo actualizado:', result);

      // Refresh the data after updating
      await fetchData();

      // Close the modal after saving
      closeEditModal();
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
    }
  };



  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [deletingItem, setDeletingItem] = useState(null);
const showDeleteConfirmation = (item) => {
  setDeletingItem(item);  // Guarda el artículo que se va a eliminar
  setDeleteModalOpen(true);  // Abre el modal de confirmación
};
const deleteArticle = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/inventory/${deletingItem.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Si la eliminación fue exitosa, actualiza los datos
    await fetchData();
    setDeleteModalOpen(false);  // Cierra el modal de confirmación
    console.log('Artículo eliminado:', deletingItem);
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
  }
};



const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (filteredData.length > 0) {
      const initialSelectedItems = filteredData.map(item => ({
        id: item.id,
        descripcion: item.producto_detalle,
        selected: false,
        quantity: 0
      }));
      setSelectedItems(initialSelectedItems);
    }
  }, [filteredData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (id, value) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: parseInt(value) || 0 } : item
      )
    );
  };

  const saveSelectedItems = () => {
    const selectedProducts = selectedItems.filter(item => item.selected);
    console.log('Productos seleccionados:', selectedProducts);
    toggleModal();
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-8 items-center">
          <button
            className={`flex items-center gap-3 text-lg font-medium ${activeTab === 'admin' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('admin')}
          >
            <span
              className={`w-5 h-5 rounded-full border-2 ${activeTab === 'admin' ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}
            ></span>
            <span className="flex flex-col leading-tight">
              <span>Artículos</span>
              <span>administrativos</span>
            </span>
          </button>
          <button
            className={`flex items-center gap-3 text-lg font-medium ${activeTab === 'aux' ? 'text-green-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('aux')}
          >
            <span
              className={`w-5 h-5 rounded-full border-2 ${activeTab === 'aux' ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}
            ></span>
            <span className="flex flex-col leading-tight">
              <span>Artículos</span>
              <span>aux mantenimiento</span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-3">
        <button
            onClick={() => window.location.href = '/download_aux'} // Redirección a la ruta /excel
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FontAwesomeIcon icon={faFileExport} className="w-6 h-6 text-green-600" />
          </button>
          <button className="flex items-center gap-2 bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50" onClick={openModal}>
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
            Agregar Artículo
          </button>
          <button
        onClick={toggleModal}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Realizar Tiquete
      </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Estante</label>
          <input
            type="text"
            value={estanteFilter}
            onChange={(e) => setEstanteFilter(e.target.value)}
            placeholder="Filtrar por estante..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Producto o Detalle</label>
          <input
            type="text"
            value={productoDetalleFilter}
            onChange={(e) => setProductoDetalleFilter(e.target.value)}
            placeholder="Filtrar por producto o detalle..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">MÓDULO</th>
              <th className="border p-2">ESTANTE</th>
              <th className="border p-2">CANTIDAD</th>
              <th className="border p-2">PRODUCTO DETALLE</th>
              <th className="border p-2">ESTADO</th>
              <th className="border p-2">ENTRADA</th>
              <th className="border p-2">SALIDA</th>
              <th className="border p-2">RESTANTE</th>
              <th className="border p-2">FECHA CREACIÓN</th>
              <th className="border p-2">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.id}</td>
                  <td className="border p-2">{item.modulo}</td>
                  <td className="border p-2">{item.estante}</td>
                  <td className="border p-2">{item.cantidad}</td>
                  <td className="border p-2">{item.producto_detalle}</td>
                  <td className="border p-2">{item.estado}</td>
                  <td className="border p-2">{item.entrada}</td>
                  <td className="border p-2">{item.salida}</td>
                  <td className="border p-2">{item.restante}</td>
                  <td className="border p-2">{new Date(item.fecha_creacion).toLocaleString()}</td>
                  <td className="border p-2">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => handleEditClick(item)}
                    >
                      <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-yellow-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => showDeleteConfirmation(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center p-4">
                  No se encontraron artículos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Modal de agregar artículo */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Agregar Artículos</h2>
              <button onClick={closeModal} className="text-red-500">Cerrar</button>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">MÓDULO</th>
                    <th className="border p-2">ESTANTE</th>
                    <th className="border p-2">CANTIDAD</th>
                    <th className="border p-2">PRODUCTO DETALLE</th>
                    <th className="border p-2">ESTADO</th>
                    <th className="border p-2">ENTRADA</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {newRows.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.modulo}
                          onChange={(e) => handleRowChange(index, 'modulo', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.estante}
                          onChange={(e) => handleRowChange(index, 'estante', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={row.cantidad}
                          onChange={(e) => handleRowChange(index, 'cantidad', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.producto_detalle}
                          onChange={(e) => handleRowChange(index, 'producto_detalle', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.estado}
                          onChange={(e) => handleRowChange(index, 'estado', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.entrada}
                          onChange={(e) => handleRowChange(index, 'entrada', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                onClick={saveArticles}
              >
                Guardar Artículos
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                onClick={addRow}
              >
                Añadir +
              </button>
            </div>
          </div>
        </div>
      )}
 {/* Edit Modal */}
 {editModalOpen && editingRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Artículo</h2>
              <button onClick={closeEditModal} className="text-red-500">Cerrar</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">MÓDULO</th>
                    <th className="border p-2">ESTANTE</th>
                    <th className="border p-2">CANTIDAD</th>
                    <th className="border p-2">PRODUCTO DETALLE</th>
                    <th className="border p-2">ESTADO</th>
                    
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingRow.modulo}
                        onChange={(e) => handleEditChange('modulo', e.target.value)}
                        className="w-full p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingRow.estante}
                        onChange={(e) => handleEditChange('estante', e.target.value)}
                        className="w-full p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={editingRow.cantidad}
                        onChange={(e) => handleEditChange('cantidad', e.target.value)}
                        className="w-full p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingRow.producto_detalle}
                        onChange={(e) => handleEditChange('producto_detalle', e.target.value)}
                        className="w-full p-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingRow.estado}
                        onChange={(e) => handleEditChange('estado', e.target.value)}
                        className="w-full p-1"
                      />
                    </td>
                  
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                onClick={saveEditedArticle}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
{/* Modal de confirmación de eliminación */}
{deleteModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">¿Estás seguro de eliminar este artículo?</h2>
        <button onClick={() => setDeleteModalOpen(false)} className="text-red-500">Cerrar</button>
      </div>
      <div className="mb-4">
        <p>¿Quieres eliminar el artículo con ID: <strong>{deletingItem?.id}</strong>?</p>
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={deleteArticle}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Eliminar
        </button>
        <button
          onClick={() => setDeleteModalOpen(false)}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}



{/* Modal de selección de artículos */}
{isModalOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
    <div
      className="bg-white p-6 rounded shadow-lg relative"
      style={{
        width: selectedItems.filter(item => item.selected).length === 0 ? '40rem' : '40rem', // Ancho más grande si no hay artículos seleccionados
      }}
    >
      <button
        onClick={toggleModal}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold mb-4">Seleccionar Artículos</h2>

      <div className="relative mb-4">
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="border border-gray-300 rounded px-4 py-2 flex justify-between items-center cursor-pointer bg-white"
        >
          <span>Selecciona Artículos</span>
          <span>▼</span>
        </div>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-full border border-gray-300 rounded bg-white shadow-lg z-10">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border-b border-gray-300"
            />
            <ul className="max-h-40 overflow-y-auto p-2">
              {selectedItems
                .filter(item =>
                  item.descripcion.toLowerCase().includes(searchTerm)
                )
                .map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-1 px-2 hover:bg-gray-100"
                  >
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                      <span>{item.descripcion}</span>
                    </label>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {selectedItems.filter(item => item.selected).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Artículos Seleccionados</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Artículo</th>
                <th className="border border-gray-300 px-4 py-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems
                .filter(item => item.selected)
                .map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.descripcion}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, Number(e.target.value))
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={saveSelectedItems}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full hover:bg-green-600"
      >
        Guardar y Cerrar
      </button>
    </div>
  </div>
)}

 {/* Modal */}
 {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg relative"
            style={{
              width: selectedItems.filter(item => item.selected).length === 0 ? '40rem' : '40rem',
            }}
          >
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Seleccionar Artículos</h2>

            <div className="relative mb-4">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="border border-gray-300 rounded px-4 py-2 flex justify-between items-center cursor-pointer bg-white"
              >
                <span>Selecciona Artículos</span>
                <span>▼</span>
              </div>

              {dropdownOpen && (
                <div className="absolute top-12 left-0 w-full border border-gray-300 rounded bg-white shadow-lg z-10">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-3 py-2 border-b border-gray-300"
                  />
                  <ul className="max-h-40 overflow-y-auto p-2">
                    {selectedItems
                      .filter(item =>
                        item.descripcion.toLowerCase().includes(searchTerm)
                      )
                      .map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between py-1 px-2 hover:bg-gray-100"
                        >
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelectItem(item.id)}
                            />
                            <span>{item.descripcion}</span>
                          </label>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {selectedItems.filter(item => item.selected).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Artículos Seleccionados</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Artículo</th>
                      <th className="border border-gray-300 px-4 py-2">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems
                      .filter(item => item.selected)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.descripcion}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, Number(e.target.value))
                              }
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={saveSelectedItems}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4 w-full hover:bg-green-600"
            >
              Guardar y Cerrar
            </button>

          </div>
        </div>
      )}
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}