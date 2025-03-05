import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto';
import { UsersService } from './users.service';
import { OktaAuthGuard } from '@src/auth';
import { CurrentUser, ICurrentUser } from '@app/common';

@Controller('users')
@UseGuards(OktaAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const data = await this.usersService.createUser(dto);

    return { data };
  }

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto) {
    const data = await this.usersService.getUsers(query);

    return { data };
  }

  @Get('me')
  async getUserProfile(@CurrentUser() user: ICurrentUser) {
    const data = await this.usersService.getUser(user.id);

    return { data };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const data = await this.usersService.getUser(id);

    return { data };
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.updateUser(id, dto);

    return { data };
  }

  @Put(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const data = await this.usersService.updateUserStatus(id, dto);

    return { data };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    const data = await this.usersService.deleteUser(id, user.id);

    return { data };
  }
}
