const express = require('express');
const router = express.Router();
const userController = require('../controllers/datacontroller');
const authenticateToken = require('../middleware/authenticateToken'); // Importar el middleware

// Ruta para login
router.post('/login', userController.loginUser);

// Ruta para registro
router.post('/register', userController.registerUser);

// Ruta para solicitar restablecimiento de contraseña
router.post('/request-password-reset', userController.requestPasswordReset);  // Nueva ruta
// Ruta para editar un usuario
router.put('/usuarios/:id', userController.updateUser);

// Ruta para restablecer la contraseña
router.post('/reset-password', userController.resetPassword);  // Nueva ruta
router.get('/inventario', userController.getInventoryData);
router.get('/inventarioadmin', userController.getAdminInventoryData);
router.post('/add_inventarioadmin', userController.addAdminInventoryItem);
router.post('/addInventoryItem', userController.addInventoryItem);
router.delete('/admin-inventory/:id', userController.deleteAdminInventoryItem);
router.delete('/inventory/:id', userController.deleteInventoryItem);
router.put('/admin-inventory_update/:id', userController.updateAdminInventoryItem);
router.put('/inventory_update/:id', userController.updateInventoryItem);
router.post('/check-email', userController.checkEmail);
// Ruta protegida (Dashboard)
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard', user: req.user });
});

module.exports = router;
