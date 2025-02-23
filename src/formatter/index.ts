import * as prettier from 'prettier';

export class CodeFormatter {
    static async format(code: string, filePath: string): Promise<string> {
        const options = await prettier.resolveConfig(filePath);
        return prettier.format(code, {
            ...options,
            filepath: filePath,
        });
    }
}
