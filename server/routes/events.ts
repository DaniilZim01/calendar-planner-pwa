import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventsController';

const router = Router();

router.get('/', authenticateToken, listEvents);
router.post('/', authenticateToken, createEvent);
router.patch('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;


