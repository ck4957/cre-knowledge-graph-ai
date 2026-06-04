import "reflect-metadata";
import { appDataSource } from "@/lib/db/app-data-source";

export async function getAppDataSource() {
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize();
  }

  return appDataSource;
}
