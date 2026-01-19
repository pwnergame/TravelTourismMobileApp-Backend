import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { UpdateTravelerDto } from './dto/update-traveler.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // Traveler Profiles
  @Get('travelers')
  @ApiOperation({ summary: 'Get all saved travelers' })
  @ApiResponse({ status: 200, description: 'Travelers retrieved successfully' })
  async getTravelers(@CurrentUser() user: User) {
    return this.usersService.getTravelers(user.id);
  }

  @Post('travelers')
  @ApiOperation({ summary: 'Add a new traveler profile' })
  @ApiResponse({ status: 201, description: 'Traveler created successfully' })
  async createTraveler(
    @CurrentUser() user: User,
    @Body() dto: CreateTravelerDto,
  ) {
    return this.usersService.createTraveler(user.id, dto);
  }

  @Get('travelers/:id')
  @ApiOperation({ summary: 'Get a specific traveler' })
  @ApiResponse({ status: 200, description: 'Traveler retrieved successfully' })
  async getTraveler(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) travelerId: string,
  ) {
    return this.usersService.getTraveler(user.id, travelerId);
  }

  @Put('travelers/:id')
  @ApiOperation({ summary: 'Update a traveler profile' })
  @ApiResponse({ status: 200, description: 'Traveler updated successfully' })
  async updateTraveler(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) travelerId: string,
    @Body() dto: UpdateTravelerDto,
  ) {
    return this.usersService.updateTraveler(user.id, travelerId, dto);
  }

  @Delete('travelers/:id')
  @ApiOperation({ summary: 'Delete a traveler profile' })
  @ApiResponse({ status: 200, description: 'Traveler deleted successfully' })
  async deleteTraveler(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) travelerId: string,
  ) {
    return this.usersService.deleteTraveler(user.id, travelerId);
  }
}
