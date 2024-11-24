import React, { useState, useEffect } from 'react';

const EditarPerfil = () => {
  const [showModal, setShowModal] = useState(false); // Modal de cambio de contraseña
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal de confirmación de cambio de contraseña
  const [showSaveConfirmationModal, setShowSaveConfirmationModal] = useState(false); // Modal de confirmación de cambios de perfil
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar los datos del localStorage
    const nombre = localStorage.getItem('userName');
    const correo = localStorage.getItem('userEmail');
    if (nombre && correo) {
      setFormData({
        nombre,
        correo,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Mostrar el modal de confirmación para guardar la nueva contraseña
    setShowConfirmationModal(true);
  };

  const handleConfirmPasswordChange = () => {
    const userId = localStorage.getItem('userId'); // Obtener el ID del usuario desde localStorage
    if (!userId) {
      setError('No se encontró un ID de usuario en localStorage');
      return;
    }

    console.log('Enviando solicitud PUT para cambiar la contraseña...');
    console.log('ID de usuario:', userId);
    console.log('Nueva contraseña:', passwordData.newPassword);

    // Enviar la solicitud PUT para cambiar la contraseña
    fetch(`http://localhost:3000/api/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contraseña: passwordData.newPassword, // Enviar con la clave 'contraseña'
      }),
    })
      .then((response) => {
        console.log('Respuesta del servidor:', response);
        if (response.ok) {
          return response.json(); // Solo continuar si la respuesta es exitosa
        } else {
          return Promise.reject('Error al cambiar la contraseña');
        }
      })
      .then((data) => {
        console.log('Datos recibidos del servidor:', data);

        // Verificar si el mensaje de éxito está en la respuesta
        if (data.message && data.message === 'Usuario actualizado correctamente') {
          setSuccessMessage('Contraseña cambiada exitosamente');
          // Eliminar datos del localStorage después de cambiar la contraseña
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');

          // Redirigir al usuario a la página principal después de cambiar la contraseña
          window.location.href = '/'; // Redirección sin React Router
        } else {
          setError('Error al actualizar la contraseña');
        }
        setShowConfirmationModal(false); // Cerrar el modal después de la confirmación
      })
      .catch((err) => {
        console.error('Error de conexión:', err);
        setError('Error de conexión: ' + err.message);
        setShowConfirmationModal(false);
      });
  };


  const handleCancelPasswordChange = () => {
    setShowConfirmationModal(false); // Cerrar el modal si el usuario cancela
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mostrar el modal de confirmación para guardar los cambios
    setShowSaveConfirmationModal(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirmationModal(false); // Cerrar el modal de confirmación

    const userId = localStorage.getItem('userId'); // Obtener el ID del usuario desde localStorage
    if (!userId) {
      setError('No se encontró un ID de usuario en localStorage');
      return;
    }

    try {
      console.log('Enviando solicitud PUT para actualizar los datos del perfil...');
      console.log('ID de usuario:', userId);
      console.log('Datos enviados:', formData);

      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
        }),
      });

      console.log('Respuesta del servidor:', response);
      if (response.ok) {
        const updatedUser = await response.json();
        setSuccessMessage('Perfil actualizado exitosamente');
        console.log('Usuario actualizado:', updatedUser);

        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('userName', formData.nombre);
        localStorage.setItem('userEmail', formData.correo);
      } else {
        const errorData = await response.json();
        setError(`Error al actualizar: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError(`Error de conexión: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Editar Perfil
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="nombre" 
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="correo" 
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Guardar Cambios
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)} // Abre el modal para cambiar contraseña
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>

      {/* Modal para cambiar contraseña */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Guardar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio de contraseña */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-green-500">¿Estás seguro de que deseas cambiar tu contraseña?</h3>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleCancelPasswordChange}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPasswordChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Seguir con el cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambios de perfil */}
      {showSaveConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-green-500">¿Estás seguro de que deseas guardar los cambios?</h3>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setShowSaveConfirmationModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfil;
