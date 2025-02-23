import { program } from '../index';

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

describe('CLI', () => {
    it('should have extract command', () => {
        const extractCommand = program.commands.find((cmd) => cmd.name() === 'extract');
        expect(extractCommand).toBeTruthy();
    });
});
