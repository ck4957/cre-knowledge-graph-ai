import "reflect-metadata";
import ormDataSource from "@/ormconfig";

export async function getAppDataSource() {
  if (!ormDataSource.isInitialized) {
    await ormDataSource.initialize();
  }

  return ormDataSource;
}

