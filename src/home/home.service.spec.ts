import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeService } from './home.service';

const mockGetHomes = [
  {
    id: 1,
    address: '1234 Setagaya ku, Tokyo',
    city: 'Tokyo',
    price: 15000000,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    numberOfBedrooms: 3,
    numberOfBathrooms: 2.5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockCreateHomeResponse = [
  {
    id: 1,
    address: '1234 Setagaya ku, Tokyo',
    city: 'Tokyo',
    price: 15000000,
    property_type: PropertyType.RESIDENTIAL,
    image: 'img1',
    number_of_bedrooms: 3,
    number_of_bathrooms: 2.5,
  },
];

const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  {
    id: 2,
    url: 'src2',
  },
  {
    id: 3,
    url: 'src3',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockCreateHomeResponse),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Kokubunji',
      price: {
        gte: 100000,
        lte: 200000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);
      expect(mockPrismaFindManyHomes).toBeCalledWith({
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
        where: filters,
      });
    });

    it('should throw not found exception if no homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '12-33-33 Toshima ku',
      city: 'Tokyo',
      number_of_bathrooms: 3,
      number_of_bedrooms: 1,
      land_size: 150,
      price: 1200000,
      property_type: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };
    it('it should call prisma.home.create with correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockCreateHomeResponse);
      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 7);
      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '12-33-33 Toshima ku',
          city: 'Tokyo',
          number_of_bathrooms: 3,
          number_of_bedrooms: 1,
          land_size: 150,
          price: 1200000,
          property_type: PropertyType.RESIDENTIAL,
          realtor_id: 7,
        },
      });
    });

    // it('it should call prisma image.create should with the correct payload', async () => {
    //   const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);
    //   jest
    //     .spyOn(prismaService.image, 'createMany')
    //     .mockImplementation(mockCreateManyImage);

    //   await service.createHome(mockCreateHomeParams, 7);
    //   expect(mockCreateManyImage).toBeCalledWith({
    //     data: [
    //       {
    //         home_id: 1,
    //         url: 'src1',
    //       },
    //     ],
    //   });
    // });
  });
});
