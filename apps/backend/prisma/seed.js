"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔄 Populando banco de dados...');
    await prisma.service.createMany({
        data: [
            { id: 1, name: 'Pedreiro', icon: '🛠' },
            { id: 2, name: 'Eletricista', icon: '💡' },
            { id: 3, name: 'Encandor', icon: '🔧' },
            { id: 4, name: 'Pintor', icon: '🎨' },
            { id: 5, name: 'Arquiteto', icon: '📐' },
            { id: 6, name: 'Engenheiro Civil', icon: '🏗' },
            { id: 7, name: 'Marceneiro', icon: '🪵' },
            { id: 8, name: 'Serralheiro', icon: '⚙' },
            { id: 9, name: 'Mont. de Móveis', icon: '🪑' },
            { id: 10, name: 'Vidraceiro', icon: '🏠' },
            { id: 11, name: 'Projetos 3D', icon: '📏' },
            { id: 12, name: 'Instalação de Drywall', icon: '🔨' },
            { id: 13, name: 'Impermeabilização', icon: '💧' },
            { id: 14, name: 'Paisagismo', icon: '🌲' },
        ],
        skipDuplicates: true,
    });
    await prisma.unitOfMeasurement.createMany({
        data: [
            { id: 1, code: 'UN', description: 'Unidade' },
            { id: 2, code: 'M²', description: 'Metro Quadrado' },
            { id: 3, code: 'M³', description: 'Metro Cúbico' },
            { id: 4, code: 'Kg', description: 'Quilogramas' },
            { id: 5, code: 'CENTO', description: 'Centena' },
            { id: 6, code: 'PAR', description: 'Pares' },
            { id: 7, code: 'MIL', description: 'Mil' },
            { id: 8, code: 'CJ', description: 'Conjunto' },
            { id: 9, code: 'L', description: 'Litro' },
            { id: 10, code: 'JG', description: 'Jogo' },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Seed concluído!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map