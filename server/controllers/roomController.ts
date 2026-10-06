import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Room } from '../models/Room.js';
import { Student } from '../models/Student.js';

// GET /api/rooms - List all rooms with stats & occupant counts
export async function getRooms(req: Request, res: Response) {
  try {
    const { block, status, type, onlyAvailable } = req.query;

    const query: any = {};
    if (block && block !== 'All') query.block = block;
    if (status && status !== 'All') query.status = status;
    if (type && type !== 'All') query.type = type;
    if (onlyAvailable === 'true') {
      query.status = 'Available';
      query.$expr = { $lt: ['$occupied', '$capacity'] };
    }

    const rooms = await Room.find(query).sort({ block: 1, roomNumber: 1 }).lean();

    // Fetch occupants for each room for display
    const roomIds = rooms.map((r) => r._id);
    const occupants = await Student.find({ roomId: { $in: roomIds }, isActive: true })
      .select('_id fullName enrollmentNo phone department semester roomId')
      .lean();

    const occupantsByRoom = occupants.reduce((acc: any, student) => {
      const rId = student.roomId?.toString();
      if (!acc[rId]) acc[rId] = [];
      acc[rId].push(student);
      return acc;
    }, {});

    const enrichedRooms = rooms.map((room) => ({
      ...room,
      occupants: occupantsByRoom[room._id.toString()] || [],
      availableBeds: Math.max(0, room.capacity - room.occupied),
    }));

    return res.json({
      success: true,
      data: enrichedRooms,
    });
  } catch (error: any) {
    console.error('getRooms error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch rooms.', error: error.message });
  }
}

// GET /api/rooms/:id - Single room details with occupant list
export async function getRoomById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room ID.' });
    }

    const room = await Room.findById(id).lean();
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const occupants = await Student.find({ roomId: room._id, isActive: true })
      .select('fullName enrollmentNo email phone department semester')
      .lean();

    return res.json({
      success: true,
      data: {
        ...room,
        occupants,
        availableBeds: Math.max(0, room.capacity - room.occupied),
      },
    });
  } catch (error: any) {
    console.error('getRoomById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch room details.', error: error.message });
  }
}

// POST /api/rooms - Add new room (Admin)
export async function createRoom(req: Request, res: Response) {
  try {
    const { roomNumber, block, floor, capacity, type, monthlyRent } = req.body;

    if (!roomNumber || !block || floor === undefined || !capacity) {
      return res.status(400).json({ success: false, message: 'Please provide roomNumber, block, floor, and capacity.' });
    }

    const normalizedRoom = roomNumber.toUpperCase().trim();
    const existing = await Room.findOne({ roomNumber: normalizedRoom });
    if (existing) {
      return res.status(400).json({ success: false, message: `Room ${normalizedRoom} already exists.` });
    }

    const newRoom = await Room.create({
      roomNumber: normalizedRoom,
      block: block.trim(),
      floor: Number(floor),
      capacity: Number(capacity),
      occupied: 0,
      type: type || 'Standard',
      status: 'Available',
      monthlyRent: monthlyRent ? Number(monthlyRent) : 4500,
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: newRoom,
    });
  } catch (error: any) {
    console.error('createRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create room.', error: error.message });
  }
}

// PUT /api/rooms/:id - Update room details (Admin)
export async function updateRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { block, floor, capacity, type, status, monthlyRent } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (capacity !== undefined) {
      const newCap = Number(capacity);
      if (newCap < room.occupied) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${newCap} when ${room.occupied} students are currently allocated.`,
        });
      }
      room.capacity = newCap;
    }

    if (block) room.block = block.trim();
    if (floor !== undefined) room.floor = Number(floor);
    if (type) room.type = type;
    if (monthlyRent !== undefined) room.monthlyRent = Number(monthlyRent);

    if (status) {
      room.status = status;
    } else {
      room.status = room.occupied >= room.capacity ? 'Full' : 'Available';
    }

    await room.save();

    return res.json({
      success: true,
      message: 'Room details updated.',
      data: room,
    });
  } catch (error: any) {
    console.error('updateRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update room.', error: error.message });
  }
}

// DELETE /api/rooms/:id - Delete room if unoccupied
export async function deleteRoom(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (room.occupied > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room ${room.roomNumber}. It currently has ${room.occupied} allocated student(s). Deallocate them first.`,
      });
    }

    await Room.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully.`,
    });
  } catch (error: any) {
    console.error('deleteRoom error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete room.', error: error.message });
  }
}

// POST /api/allocations - Allocate student to room
export async function allocateStudent(req: Request, res: Response) {
  try {
    const { studentId, roomId, bedNo } = req.body;

    if (!studentId || !roomId) {
      return res.status(400).json({ success: false, message: 'Please provide studentId and roomId.' });
    }

    const [student, targetRoom] = await Promise.all([
      Student.findById(studentId),
      Room.findById(roomId),
    ]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    if (!targetRoom) {
      return res.status(404).json({ success: false, message: 'Target room not found.' });
    }

    // Business rule: Check if target room is full
    if (targetRoom.occupied >= targetRoom.capacity) {
      return res.status(400).json({
        success: false,
        message: `Allocation failed: Room ${targetRoom.roomNumber} is already at full capacity (${targetRoom.capacity}/${targetRoom.capacity}).`,
      });
    }

    // If student was previously allocated to a different room, free that bed
    if (student.roomId) {
      if (student.roomId.toString() === roomId.toString()) {
        return res.status(400).json({
          success: false,
          message: `Student is already allocated to room ${targetRoom.roomNumber}.`,
        });
      }

      const previousRoom = await Room.findById(student.roomId);
      if (previousRoom) {
        previousRoom.occupied = Math.max(0, previousRoom.occupied - 1);
        previousRoom.status = previousRoom.occupied >= previousRoom.capacity ? 'Full' : 'Available';
        await previousRoom.save();
      }
    }

    // Assign to new room
    student.roomId = targetRoom._id;
    if (bedNo) student.bedNo = bedNo;
    await student.save();

    targetRoom.occupied += 1;
    targetRoom.status = targetRoom.occupied >= targetRoom.capacity ? 'Full' : 'Available';
    await targetRoom.save();

    return res.json({
      success: true,
      message: `Successfully allocated student ${student.fullName} to room ${targetRoom.roomNumber}.`,
      data: {
        student,
        room: targetRoom,
      },
    });
  } catch (error: any) {
    console.error('allocateStudent error:', error);
    return res.status(500).json({ success: false, message: 'Allocation failed.', error: error.message });
  }
}

// POST /api/allocations/deallocate - Remove student from room
export async function deallocateStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Please provide studentId.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (!student.roomId) {
      return res.status(400).json({ success: false, message: 'Student is not currently allocated to any room.' });
    }

    const room = await Room.findById(student.roomId);
    if (room) {
      room.occupied = Math.max(0, room.occupied - 1);
      room.status = room.occupied >= room.capacity ? 'Full' : 'Available';
      await room.save();
    }

    student.roomId = null;
    student.bedNo = '';
    await student.save();

    return res.json({
      success: true,
      message: `Deallocated ${student.fullName} successfully. Bed freed up.`,
      data: { student },
    });
  } catch (error: any) {
    console.error('deallocateStudent error:', error);
    return res.status(500).json({ success: false, message: 'Deallocation failed.', error: error.message });
  }
}
