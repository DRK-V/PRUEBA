import React, { useEffect, useState } from 'react';
import { useArticlesContext } from './ArticlesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faPrint, faPen, faTrash, faPlus, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export function AdminArticles() {
  const { activeTab, setActiveTab } = useArticlesContext();
  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados para los filtros
  const [ubicacionFilter, setUbicacionFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados para el modal y la tabla de añadir artículo
  const [modalOpen, setModalOpen] = useState(false);
  const [newRows, setNewRows] = useState([{ item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);

  // Estado para el modal de éxito/error
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Función para mostrar el modal de confirmación
  const showDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };
  // New state for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEditClick = (item) => {
    setEditingItem({
      id: item.id,
      item: item.item,
      descripcion: item.descripcion,
      proveedor: item.proveedor,
      ubicacion: item.ubicacion,
      estado: item.estado,
      fecha_creacion: item.fecha_creacion // Mantener la fecha original
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEditedItem = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin-inventory_update/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar los datos locales manteniendo la fecha de creación
      const updatedData = adminData.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...editingItem,
            fecha_creacion: item.fecha_creacion // Asegurar que mantenemos la fecha original
          };
        }
        return item;
      });

      setAdminData(updatedData);
      setFilteredData(updatedData);

      setSuccessMessage('Artículo actualizado correctamente');
      setSuccessModalOpen(true);
      setEditModalOpen(false);
      setEditingItem(null);

      // Refrescar los datos después de la actualización
      fetchData();
    } catch (error) {
      console.error('Error al actualizar el artículo:', error);
      setSuccessMessage('Error al actualizar el artículo');
      setSuccessModalOpen(true);
    }
  };

  // Función para eliminar un artículo
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin-inventory/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedData = adminData.filter(item => item.id !== itemToDelete.id);
      setAdminData(updatedData);
      setFilteredData(filteredData.filter(item => item.id !== itemToDelete.id));

      setSuccessMessage('Artículo eliminado correctamente');
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error al eliminar el artículo:', error);
      setSuccessMessage('Hubo un error al eliminar el artículo');
      setSuccessModalOpen(true);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Función para obtener los datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/inventarioadmin');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      // Ordenar los datos por ID en orden ascendente
      const sortedData = data.data.sort((a, b) => {
        // Convertir IDs a números para asegurar un ordenamiento numérico correcto
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return idA - idB;
      });
      setAdminData(sortedData);
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
    // Filtrar los datos según los filtros y mantener el orden por ID
    const filteredResults = adminData
      .filter((item) => {
        const matchesUbicacion = ubicacionFilter
          ? item.ubicacion.toLowerCase().includes(ubicacionFilter.toLowerCase())
          : true;

        const itemFecha = new Date(item.fecha_creacion);

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
            matchesUbicacion &&
            itemFecha >= startOfDay &&
            itemFecha <= endOfDay
          );
        }

        return matchesUbicacion && matchesFechaDesde && matchesFechaHasta;
      })
      .sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Mantener el ordenamiento por ID después de filtrar

    setFilteredData(filteredResults);
  }, [ubicacionFilter, fechaDesde, fechaHasta, adminData]);

  const addRow = () => {
    setNewRows([...newRows, { item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...newRows];
    updatedRows[index][field] = value;
    setNewRows(updatedRows);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewRows([{ item: '', descripcion: '', proveedor: '', ubicacion: '', estado: '' }]);
  };

  const saveArticles = async () => {
    try {
      const validRows = newRows.filter(
        (row) =>
          row.item.trim() !== '' &&
          row.descripcion.trim() !== '' &&
          row.proveedor.trim() !== '' &&
          row.ubicacion.trim() !== '' &&
          row.estado.trim() !== ''
      );

      if (validRows.length === 0) {
        setSuccessMessage('Por favor, complete todos los campos del artículo');
        setSuccessModalOpen(true);
        return;
      }

      for (let row of validRows) {
        const response = await fetch('http://localhost:3000/api/add_inventarioadmin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });

        if (!response.ok) {
          throw new Error(`Error al guardar la fila: ${response.statusText}`);
        }
      }

      // Mensaje personalizado según la cantidad de artículos añadidos
      const successMsg = validRows.length === 1
        ? `Se ha añadido el artículo "${validRows[0].descripcion}" correctamente`
        : `Se han añadido ${validRows.length} artículos correctamente`;

      setSuccessMessage(successMsg);
      setSuccessModalOpen(true);
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error al guardar artículos:', error);
      setSuccessMessage('Hubo un error al guardar los artículos');
      setSuccessModalOpen(true);
    }
  };



  // Estados para el modal de selección de artículos
  //const [isModalOpen, setIsModalOpen] = useState(false);
  //const [searchTerm, setSearchTerm] = useState('');
  //const [selectedItems, setSelectedItems] = useState([]);
  //const [dropdownOpen, setDropdownOpen] = useState(false);



  // Funciones para el modal de selección
  //const toggleModal = () => {
  //setIsModalOpen(!isModalOpen);
  //if (!isModalOpen) {
  //  setSelectedItems(adminData.map(item => ({
  //    ...item,
  //   selected: false,
  //     quantity: 0
  //  })));
  // }
  //};

  //const handleSearch = (e) => {
  // setSearchTerm(e.target.value.toLowerCase());
  //};

  //const toggleSelectItem = (id) => {
  //setSelectedItems(prev =>
  //prev.map(item =>
  // item.id === id ? { ...item, selected: !item.selected } : item
  // )
  // );
  //};

  //const handleQuantityChange = (id, value) => {
  //  setSelectedItems(prev =>
  //  prev.map(item =>
  //    item.id === id ? { ...item, quantity: value } : item
  //  )
  // );
  //};



  // Función para guardar los artículos seleccionados
  //const saveSelectedItems = () => {
  //const selectedItemsData = selectedItems.filter(item => item.selected);
  //selectedItemsData.forEach(item => {
  // console.log('Item guardado:', item); // Imprime los datos del item en consola
  // });

  // Aquí podrías realizar cualquier acción adicional, como enviar los datos al servidor o actualizar el estado
  //  setIsModalOpen(false);  // Cierra el modal después de guardar
  //};




  return (
    <div className="flex flex-col h-full">
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
            onClick={() => window.location.href = '/download_admin'} // Redirección a la ruta /excel
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FontAwesomeIcon icon={faFileExport} className="w-6 h-6 text-green-600" />
          </button>

          <button
            className="flex items-center gap-2 bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
            onClick={() => setModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
            Agregar Artículo
          </button>
          {/*  <button
        onClick={toggleModal}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Abrir Modal
      </button> */}

        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ubicación</label>
          <input
            type="text"
            value={ubicacionFilter}
            onChange={(e) => setUbicacionFilter(e.target.value)}
            placeholder="Filtrar por ubicación..."
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

      {/* Tabla de artículos */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredData.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">ITEM</th>
                <th className="border p-2">DESCRIPCIÓN</th>
                <th className="border p-2">PROVEEDOR</th>
                <th className="border p-2">UBICACIÓN</th>
                <th className="border p-2">ESTADO</th>
                <th className="border p-2">FECHA CREACIÓN</th>
                <th className="border p-2">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="border p-2">{item.id}</td>
                  <td className="border p-2">{item.item}</td>
                  <td className="border p-2">
                    <div className="truncate max-w-[12rem]" title={item.descripcion}>
                      {item.descripcion}
                    </div>
                  </td>
                  <td className="border p-2">{item.proveedor}</td>
                  <td className="border p-2">{item.ubicacion}</td>
                  <td className="border p-2">{item.estado}</td>
                  <td className="border p-2">
                    {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleString() : ''}
                  </td>
                  <td className="border p-2 flex justify-center gap-2">
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron resultados</p>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Confirmar Eliminación</h2>
            <p className="text-gray-600 text-center mb-6">
              ¿Está seguro que desea eliminar el artículo{' '}
              <span className="font-semibold">
                {itemToDelete?.item} - {itemToDelete?.descripcion}
              </span>
              ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <th className="border p-2">ITEM</th>
                    <th className="border p-2">DESCRIPCIÓN</th>
                    <th className="border p-2">PROVEEDOR</th>
                    <th className="border p-2">UBICACIÓN</th>
                    <th className="border p-2">ESTADO</th>
                    <th className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {newRows.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) => handleRowChange(index, 'item', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.descripcion}
                          onChange={(e) => handleRowChange(index, 'descripcion', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.proveedor}
                          onChange={(e) => handleRowChange(index, 'proveedor', e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={row.ubicacion}
                          onChange={(e) => handleRowChange(index, 'ubicacion', e.target.value)}
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
                      </td>
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

      {/* Modal de éxito/error */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center text-green-500 mb-4">
              <FontAwesomeIcon
                icon={successMessage.includes('error') ? faExclamationTriangle : faCheckCircle}
                className="w-12 h-12"
                style={{ color: successMessage.includes('error') ? '#EF4444' : '#10B981' }}
              />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">
              {successMessage.includes('error') ? 'Error' : 'Éxito'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {successMessage}
            </p>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setSuccessModalOpen(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Artículo</h2>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-red-500"
              >
                Cerrar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">ITEM</th>
                    <th className="border p-2">DESCRIPCIÓN</th>
                    <th className="border p-2">PROVEEDOR</th>
                    <th className="border p-2">UBICACIÓN</th>
                    <th className="border p-2">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingItem?.item || ''}
                        onChange={(e) => handleEditChange('item', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingItem?.descripcion || ''}
                        onChange={(e) => handleEditChange('descripcion', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingItem?.proveedor || ''}
                        onChange={(e) => handleEditChange('proveedor', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingItem?.ubicacion || ''}
                        onChange={(e) => handleEditChange('ubicacion', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editingItem?.estado || ''}
                        onChange={(e) => handleEditChange('estado', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
                onClick={saveEditedItem}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}



      {/*{isModalOpen && (
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
)} */}




    </div>
  );
}
