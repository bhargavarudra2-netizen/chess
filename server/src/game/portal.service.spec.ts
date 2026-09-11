import { Test, TestingModule } from '@nestjs/testing';
import { PortalService } from './portal.service';

describe('PortalService', () => {
    let service: PortalService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PortalService],
        }).compile();

        service = module.get<PortalService>(PortalService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate portals', () => {
        const portals = service.generatePortals();
        expect(portals.length).toBeGreaterThanOrEqual(4); // Min 2 pairs
        expect(portals.length % 2).toBe(0); // Always pairs
    });

    it('should validate bishop rule', () => {
        // Same color squares
        const from = { r: 0, c: 0 }; // a8 (light)
        const to = { r: 2, c: 2 }; // c6 (light)
        expect(service.canBishopUsePortal(from, to)).toBe(true);

        // Different color squares
        const toDiff = { r: 2, c: 1 }; // b6 (dark)
        expect(service.canBishopUsePortal(from, toDiff)).toBe(false);
    });

    it('should prioritize royal link and fallback if royal link destination is occupied by friendly piece', () => {
        const portals = [
            { id: 'p_entrance', r: 4, c: 4, linkedTo: 'p_original', royalLinkedTo: 'p_royal', fallbackLinkedTo: 'p_original' },
            { id: 'p_original', r: 2, c: 2, linkedTo: 'p_entrance' },
            { id: 'p_royal', r: 3, c: 3, linkedTo: 'p_entrance' },
        ];

        // 1. When Royal Link square (3,3 -> d5) is empty, resolve to Royal Link (3, 3)
        const emptyBoardMock = {
            get: jest.fn().mockReturnValue(null),
        };
        const dest1 = service.resolvePortalDestination(
            portals,
            { r: 5, c: 4 },
            { r: 4, c: 4 },
            'n',
            'w',
            emptyBoardMock
        );
        expect(dest1).toEqual({ r: 3, c: 3 });

        // 2. When Royal Link square (3,3) is occupied by friendly piece ('w'), fallback to (2, 2)
        const blockedBoardMock = {
            get: jest.fn((sq: string) => {
                if (sq === 'd5') return { type: 'p', color: 'w' }; // friendly piece on royal square
                return null;
            }),
        };
        const dest2 = service.resolvePortalDestination(
            portals,
            { r: 5, c: 4 },
            { r: 4, c: 4 },
            'n',
            'w',
            blockedBoardMock
        );
        expect(dest2).toEqual({ r: 2, c: 2 });
    });
});
