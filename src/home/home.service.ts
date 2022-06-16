import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  city: string;
  price: number;
  land_size: number;
  property_type: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  city?: string;
  price?: number;
  land_size?: number;
  property_type?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  // getHomes
  async getHomes(filter?: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0]?.url };
      delete fetchHome.images;

      return new HomeResponseDto(fetchHome);
    });
  }

  // getHome
  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) {
      throw new NotFoundException();
    }
    return new HomeResponseDto(home);
  }

  // create home
  async createHome(
    {
      address,
      city,
      number_of_bathrooms,
      number_of_bedrooms,
      land_size,
      price,
      property_type,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        number_of_bathrooms,
        number_of_bedrooms,
        land_size,
        price,
        property_type,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({ data: homeImages });
    return new HomeResponseDto(home);
  }

  // update Home
  async updateHomeById(id: number, data: UpdateHomeParams) {
    const homeExists = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!homeExists) {
      throw new NotFoundException();
    }
    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });

    console.log({ data });

    console.log({ updatedHome });
    return new HomeResponseDto(updatedHome);
  }

  // delete home
  async deleteHomeById(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });
    const homeExists = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!homeExists) {
      throw new NotFoundException();
    }
    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
    return;
  }

  // getRealtorByHomeId
  async getRealtorByHomeId(id: number) {
    const home = this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home;
  }
}
