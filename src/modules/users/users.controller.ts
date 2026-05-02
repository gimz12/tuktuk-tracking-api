import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('users')
@ApiBearerAuth('user-jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a user (HQ admin only)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return this.sanitize(user.toObject() as unknown as Record<string, unknown>);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (HQ admin only)' })
  async list() {
    const all = await this.userService.listAll();
    return all.map((u) => this.sanitize(u.toObject() as unknown as Record<string, unknown>));
  }

  private sanitize(user: Record<string, unknown>) {
    const { passwordHash: _ph, __v: _v, ...rest } = user;
    void _ph;
    void _v;
    return rest;
  }
}
