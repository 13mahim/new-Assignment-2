import { Response, NextFunction } from 'express';
import { VehiclesService } from './vehicles.service';
import { AuthRequest } from '../../middlewares/auth.middleware';

const vehiclesService = new VehiclesService();

export class VehiclesController {
  async createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.createVehicle(req.body);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehiclesService.getAllVehicles();

      res.status(200).json({
        success: true,
        message: vehicles.length > 0 ? 'Vehicles retrieved successfully' : 'No vehicles found',
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVehicleById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = Array.isArray(req.params.vehicleId) ? req.params.vehicleId[0] : req.params.vehicleId;
      const vehicle = await vehiclesService.getVehicleById(parseInt(vehicleId));

      res.status(200).json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = Array.isArray(req.params.vehicleId) ? req.params.vehicleId[0] : req.params.vehicleId;
      const vehicle = await vehiclesService.updateVehicle(parseInt(vehicleId), req.body);

      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicleId = Array.isArray(req.params.vehicleId) ? req.params.vehicleId[0] : req.params.vehicleId;
      await vehiclesService.deleteVehicle(parseInt(vehicleId));

      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
