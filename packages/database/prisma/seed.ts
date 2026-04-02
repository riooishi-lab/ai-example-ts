import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	let adminUser = await prisma.user.findFirst({ orderBy: { id: "asc" } });
	if (!adminUser) {
		adminUser = await prisma.user.create({
			data: {
				authProviderId: "seed-admin-user",
				email: "admin@example.com",
				firstName: "管理者",
				lastName: "太郎",
				role: "SYSTEM_ADMIN",
				isActive: true,
				isEmailVerified: true,
			},
		});
		console.log(
			`Created admin user "${adminUser.email}" (id: ${adminUser.id})`,
		);
	}

	let maintenanceUser = await prisma.user.findFirst({
		where: { role: "MAINTENANCE" },
	});
	if (!maintenanceUser) {
		maintenanceUser = await prisma.user.create({
			data: {
				authProviderId: "seed-maintenance-user",
				email: "maintenance@example.com",
				firstName: "保全",
				lastName: "次郎",
				role: "MAINTENANCE",
				isActive: true,
				isEmailVerified: true,
			},
		});
		console.log(
			`Created maintenance user "${maintenanceUser.email}" (id: ${maintenanceUser.id})`,
		);
	}

	let fieldWorker = await prisma.user.findFirst({
		where: { role: "FIELD_WORKER" },
	});
	if (!fieldWorker) {
		fieldWorker = await prisma.user.create({
			data: {
				authProviderId: "seed-field-worker",
				email: "worker@example.com",
				firstName: "現場",
				lastName: "三郎",
				role: "FIELD_WORKER",
				lineName: "ライン A",
				isActive: true,
				isEmailVerified: true,
			},
		});
		console.log(
			`Created field worker "${fieldWorker.email}" (id: ${fieldWorker.id})`,
		);
	}

	const invitationToken = "dev-signup-token";
	const existingInvitation = await prisma.invitation.findUnique({
		where: { token: invitationToken },
	});
	if (!existingInvitation) {
		await prisma.invitation.create({
			data: {
				token: invitationToken,
				email: "dev@example.com",
				firstName: "開発",
				lastName: "ユーザー",
				role: "MAINTENANCE",
				status: "PENDING",
				invitedById: adminUser.id,
				expiresAt: new Date("2099-12-31"),
			},
		});
		console.log(
			`Created invitation for dev@example.com (token: ${invitationToken})`,
		);
	}

	const equipmentData = [
		{
			name: "プレス機 A-1",
			lineName: "ライン A",
			machineNumber: "A-001",
			category: "プレス",
		},
		{
			name: "プレス機 A-2",
			lineName: "ライン A",
			machineNumber: "A-002",
			category: "プレス",
		},
		{
			name: "旋盤 B-1",
			lineName: "ライン B",
			machineNumber: "B-001",
			category: "旋盤",
		},
		{
			name: "研削盤 B-2",
			lineName: "ライン B",
			machineNumber: "B-002",
			category: "研削",
		},
		{
			name: "溶接機 C-1",
			lineName: "ライン C",
			machineNumber: "C-001",
			category: "溶接",
		},
		{
			name: "搬送コンベア D-1",
			lineName: "ライン D",
			machineNumber: "D-001",
			category: "搬送",
		},
		{
			name: "塗装ロボット E-1",
			lineName: "ライン E",
			machineNumber: "E-001",
			category: "塗装",
		},
		{
			name: "検査装置 F-1",
			lineName: "ライン F",
			machineNumber: "F-001",
			category: "検査",
		},
	];

	const existingEquipmentCount = await prisma.equipment.count();
	if (existingEquipmentCount === 0) {
		for (const eq of equipmentData) {
			const equipment = await prisma.equipment.create({
				data: {
					...eq,
					installedAt: new Date("2020-04-01"),
				},
			});

			await prisma.part.createMany({
				data: [
					{
						equipmentId: equipment.id,
						name: "ベアリング",
						standardReplaceCycleDays: 365,
						lastReplacedAt: new Date("2025-10-01"),
					},
					{
						equipmentId: equipment.id,
						name: "モーター",
						standardReplaceCycleDays: 730,
						lastReplacedAt: new Date("2025-01-15"),
					},
					{
						equipmentId: equipment.id,
						name: "ベルト",
						standardReplaceCycleDays: 180,
						lastReplacedAt: new Date("2025-12-01"),
					},
				],
			});

			await prisma.inspectionItem.createMany({
				data: [
					{
						equipmentId: equipment.id,
						name: "温度",
						inputType: "NUMERIC",
						unit: "℃",
						upperLimit: 80,
						lowerLimit: 10,
						sortOrder: 1,
					},
					{
						equipmentId: equipment.id,
						name: "振動値",
						inputType: "NUMERIC",
						unit: "mm/s",
						upperLimit: 5.0,
						lowerLimit: 0,
						sortOrder: 2,
					},
					{
						equipmentId: equipment.id,
						name: "電流値",
						inputType: "NUMERIC",
						unit: "A",
						upperLimit: 15,
						lowerLimit: 2,
						sortOrder: 3,
					},
					{
						equipmentId: equipment.id,
						name: "外観チェック",
						inputType: "TEXT",
						sortOrder: 4,
					},
				],
			});

			console.log(
				`Created equipment "${equipment.name}" with parts and inspection items`,
			);
		}
	}

	console.log("Seed completed.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
