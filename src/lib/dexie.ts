import Dexie, { Table } from "dexie";

interface MemberData extends Member {
  created: Room[];
  joined: Room[];
}

class AppDb extends Dexie {
  members!: Table<MemberData, string>;

  constructor() {
    super("appDb");
    this.version(1).stores({
      members: "id",
    });
  }
}

export const dexieDB = new AppDb();
