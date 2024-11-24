const jwt = require('jsonwebtoken');
const supabase = require('../db/db.js');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

//sesion de login y reset_password
// Configuración de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Login de usuario
const loginUser = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, contraseña')
      .eq('correo', correo)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(contraseña, data.contraseña);

    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: data.id, correo: data.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', user: data, token });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Registro de usuario
const registerUser = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contraseña: hashedPassword }])
      .select();

    if (error) {
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }

    res.status(201).json({ message: 'Usuario registrado correctamente', user: data[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Solicitar restablecimiento de contraseña

const checkEmail = async (req, res) => {
  const { correo } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, correo')
      .eq('correo', correo)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Correo no encontrado' });
    }

    // Si el correo existe, retornamos el id y correo
    res.json({ id: data.id, correo: data.correo });
  } catch (err) {
    res.status(500).json({ message: 'Error al verificar el correo' });
  }
};
// Procesar el enlace de restablecimiento (GET)
const requestPasswordReset = async (req, res) => {
  const { correo } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, correo')
      .eq('correo', correo)
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'El correo no está registrado' });
    }

    // Generar el token de JWT
    const token = jwt.sign({ id: data.id, correo: data.correo }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Crear el enlace de restablecimiento con los datos
    const resetLink = `${process.env.RESET_PASSWORD_URL}?id=${data.id}&correo=${data.correo}&token=${token}`;


    // Correo al usuario para el restablecimiento de contraseña
    const userMsg = {
      to: correo,
      from: 'flv3dsc@gmail.com', // Cambia por tu correo verificado
      subject: 'Restablecimiento de contraseña',
      text: `
        Estimado usuario,

        Para restablecer tu contraseña, por favor haz clic en el siguiente enlace:
        ${resetLink}

        Este enlace contiene los datos de tu cuenta:
        - ID: ${data.id}
        - Correo: ${data.correo}

        Si no solicitaste este cambio, por favor ignora este mensaje.
      `,
    };

    // Enviar el correo
    await sgMail.send(userMsg);

    res.json({ message: 'Correo de restablecimiento enviado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al solicitar restablecimiento de contraseña' });
  }
};


// Procesar el enlace de restablecimiento (GET)
const handleResetLink = async (req, res) => {
  const { token } = req.query;  // El token se obtiene de la query del enlace

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Imprimir en consola el correo y el id del usuario que ha abierto el enlace
    console.log(`El usuario con correo ${decoded.correo} y ID ${decoded.id} abrió el enlace de restablecimiento.`);

    // Responder con el correo y el token para usarlo en el frontend
    res.render('reset-password', {
      correo: decoded.correo,  // Enviamos el correo a la vista
      token: token,            // Enviamos el token para usarlo en el formulario
    });
  } catch (err) {
    console.error('Error al procesar el enlace:', err);
    res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });
  }
};


// Restablecer contraseña



// Cambiar la contraseña
const resetPassword = async (req, res) => {
  const { correo, password } = req.body; // Recibir correo y password desde el cuerpo de la solicitud

  try {
    // Buscar al usuario por el correo
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, correo')
      .eq('correo', correo)  // Usamos el correo para buscar al usuario
      .single();

    if (error || !data) {
      console.error('Error al buscar el usuario:', error);
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Imprimir en consola el correo y el id del usuario que está restableciendo la contraseña
    console.log(`El usuario con correo ${correo} y id ${data.id} está cambiando la contraseña`);

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña hasheada:', hashedPassword);

    // Actualizar la contraseña del usuario (usando 'contraseña' en lugar de 'password')
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ contraseña: hashedPassword })  // Actualizar la contraseña
      .eq('id', data.id);  // Usar el id del usuario para la actualización

    if (updateError) {
      console.error('Error al actualizar la contraseña:', updateError);
      return res.status(500).json({ message: 'Error al cambiar la contraseña' });
    }

    res.json({ message: 'Contraseña cambiada con éxito' });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(400).json({ message: 'Error al procesar la solicitud' });
  }
};
//fin sesion login




const getInventoryData = async (req, res) => {
  try {
    // Obtener todos los datos de la tabla 'inventario'
    const { data, error: fetchError } = await supabase
      .from('inventario')
      .select('*');

    if (fetchError) {
      console.error('Error al obtener datos del inventario:', fetchError);
      return res.status(500).json({ message: 'Error al obtener los datos del inventario' });
    }

    // Contar el número total de registros en la tabla 'inventario'
    const { count, error: countError } = await supabase
      .from('inventario')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error al contar los registros del inventario:', countError);
      return res.status(500).json({ message: 'Error al contar los registros del inventario' });
    }

    // Enviar los datos y el número total de registros
    res.json({ data, totalRecords: count });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const getAdminInventoryData = async (req, res) => {
  try {
    // Obtener todos los datos de la tabla 'inventario_administrativo'
    const { data, error: fetchError } = await supabase
      .from('inventario_administrativo')
      .select('*');

    if (fetchError) {
      console.error('Error al obtener datos del inventario administrativo:', fetchError);
      return res.status(500).json({ message: 'Error al obtener los datos del inventario administrativo' });
    }

    // Contar el número total de registros en la tabla 'inventario_administrativo'
    const { count, error: countError } = await supabase
      .from('inventario_administrativo')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error al contar los registros del inventario administrativo:', countError);
      return res.status(500).json({ message: 'Error al contar los registros del inventario administrativo' });
    }

    // Enviar los datos y el número total de registros
    res.json({ data, totalRecords: count });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const addAdminInventoryItem = async (req, res) => {
  const { item, descripcion, proveedor, ubicacion, estado, fecha } = req.body;

  try {
    // Insertar un nuevo registro en la tabla 'inventario_administrativo'
    const { data, error } = await supabase
      .from('inventario_administrativo')
      .insert([
        {
          item,
          descripcion,
          proveedor,
          ubicacion,
          estado,
        },
      ])
      .select();

    if (error) {
      console.error('Error al insertar el item en inventario administrativo:', error);
      return res.status(500).json({ message: 'Error al agregar el item al inventario administrativo' });
    }

    res.status(201).json({
      message: 'Item agregado correctamente al inventario administrativo',
      item: data[0],
    });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const deleteAdminInventoryItem = async (req, res) => {
  const { id } = req.params;  // Obtener el ID del registro desde los parámetros de la URL

  try {
    // Eliminar el registro de la tabla 'inventario_administrativo' usando el id
    const { data, error } = await supabase
      .from('inventario_administrativo')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al eliminar el item de inventario administrativo:', error);
      return res.status(500).json({ message: 'Error al eliminar el item del inventario administrativo' });
    }

    // Si no se encuentra el registro, enviar un mensaje adecuado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    res.json({ message: 'Item eliminado correctamente del inventario administrativo', item: data[0] });
  } catch (err) {
    console.error('Error al procesar la solicitud de eliminación:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateAdminInventoryItem = async (req, res) => {
  const { id } = req.params; // Obtener el ID del registro desde los parámetros de la URL
  const { item, descripcion, proveedor, ubicacion, estado } = req.body; // Datos para actualizar

  // Validar que el ID sea un número entero
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({ message: 'ID inválido, debe ser un número entero' });
  }

  try {
    // Actualizar el registro en la tabla 'inventario_administrativo'
    const { data, error } = await supabase
      .from('inventario_administrativo')
      .update({ item, descripcion, proveedor, ubicacion, estado }) // Solo se actualizan los campos recibidos
      .eq('id', parsedId)
      .select();

    if (error) {
      console.error('Error al actualizar el item en inventario administrativo:', error);
      return res.status(500).json({ message: 'Error al actualizar el item en el inventario administrativo' });
    }

    // Si no se encuentra el registro, enviar un mensaje adecuado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    res.json({ message: 'Item actualizado correctamente', item: data[0] });
  } catch (err) {
    console.error('Error al procesar la solicitud de actualización:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const addInventoryItem = async (req, res) => {
  const { modulo, estante, cantidad, producto_detalle, estado, entrada } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!modulo || !estante || !cantidad || !producto_detalle || !estado || !entrada) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Insertar el artículo en la tabla 'inventario' con los campos proporcionados
    const { data, error } = await supabase
      .from('inventario')
      .insert([
        {
          modulo,
          estante,
          cantidad,
          producto_detalle,
          estado,
          entrada
        },
      ])
      .select();

    if (error) {
      console.error('Error al agregar el artículo al inventario:', error);
      return res.status(500).json({ message: 'Error al agregar el artículo al inventario' });
    }

    res.status(201).json({
      message: 'Artículo agregado correctamente al inventario',
      item: data[0],
    });
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateInventoryItem = async (req, res) => {
  const { id } = req.params;  // Obtener el ID del artículo desde los parámetros de la URL
  const { modulo, estante, cantidad, producto_detalle, estado, entrada } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!modulo || !estante || !cantidad || !producto_detalle || !estado || !entrada) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Actualizar el artículo en la tabla 'inventario' usando el ID proporcionado
    const { data, error } = await supabase
      .from('inventario')
      .update({
        modulo,
        estante,
        cantidad,
        producto_detalle,
        estado
      })
      .eq('id', id)  // Filtrar por el ID del artículo
      .select();

    if (error) {
      console.error('Error al actualizar el artículo en el inventario:', error);
      return res.status(500).json({ message: 'Error al actualizar el artículo en el inventario' });
    }

    // Si no se encuentra el artículo con el ID proporcionado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Responder con los datos del artículo actualizado
    res.json({
      message: 'Artículo actualizado correctamente',
      item: data[0],
    });
  } catch (err) {
    console.error('Error al procesar la solicitud de actualización:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;  // Obtener el ID del artículo desde los parámetros de la URL

  try {
    // Eliminar el artículo de la tabla 'inventario' usando el ID proporcionado
    const { data, error } = await supabase
      .from('inventario')
      .delete()
      .eq('id', id)  // Filtrar por el ID del artículo
      .select();

    if (error) {
      console.error('Error al eliminar el artículo del inventario:', error);
      return res.status(500).json({ message: 'Error al eliminar el artículo del inventario' });
    }

    // Si no se encuentra el artículo con el ID proporcionado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    // Responder con un mensaje de éxito
    res.json({
      message: 'Artículo eliminado correctamente del inventario',
      item: data[0],
    });
  } catch (err) {
    console.error('Error al procesar la solicitud de eliminación:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Editar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;  // Obtener el ID del usuario desde los parámetros de la URL
  const { nombre, correo, contraseña } = req.body; // Datos para actualizar

  // Construir un objeto con los campos que se han proporcionado
  let updateData = {};

  if (nombre) updateData.nombre = nombre;
  if (correo) updateData.correo = correo;
  if (contraseña) updateData.contraseña = await bcrypt.hash(contraseña, 10);  // Si la contraseña es proporcionada, se encripta

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'Debes proporcionar al menos un campo para actualizar' });
  }

  try {
    // Actualizar el usuario con los campos proporcionados
    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData) // Solo actualizamos los campos que se pasaron
      .eq('id', id)  // Filtrar por el ID del usuario
      .select();

    if (error) {
      console.error('Error al actualizar el usuario:', error);
      return res.status(500).json({ message: 'Error al actualizar el usuario' });
    }

    // Si no se encuentra el usuario, enviar un mensaje adecuado
    if (data.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado correctamente',
      user: data[0],  // Devolver el usuario actualizado
    });
  } catch (err) {
    console.error('Error al procesar la solicitud de actualización:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  //sesion login
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  checkEmail,
  handleResetLink,
  //fin login

  getInventoryData,
  getAdminInventoryData,
  addAdminInventoryItem,
  deleteAdminInventoryItem,
  updateAdminInventoryItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateUser,
};
