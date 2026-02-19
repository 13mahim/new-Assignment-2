import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const usersController = new UsersController();

router.get('/', authenticate, authorize('admin'), usersController.getAllUsers);
router.put('/:userId', authenticate, usersController.updateUser);
router.delete('/:userId', authenticate, authorize('admin'), usersController.deleteUser);

export default router;
