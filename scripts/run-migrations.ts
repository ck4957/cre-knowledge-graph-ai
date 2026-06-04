import { appDataSource } from "@/lib/db/app-data-source";

async function main() {
  const direction = process.argv[2] ?? "run";

  try {
    await appDataSource.initialize();

    if (direction === "revert") {
      await appDataSource.undoLastMigration();
      console.log("Reverted latest TypeORM migration.");
      return;
    }

    if (direction !== "run") {
      throw new Error(`Unsupported migration direction "${direction}". Use "run" or "revert".`);
    }

    const migrations = await appDataSource.runMigrations();
    console.log(`Ran ${migrations.length} TypeORM migration(s).`);
  } finally {
    if (appDataSource.isInitialized) {
      await appDataSource.destroy();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
