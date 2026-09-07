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
});
