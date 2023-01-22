import Manifest from "../../manifest.json";

export const clamp = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max);
};

export const check_gamemode = () => {
  return game.currentGamemode.namespace === Manifest.namespace;
};

export const dungeon_from_id = <TDungeon extends Dungeon>(
  id: DungeonID | TDungeon
): TDungeon => {
  if (typeof id !== "string") return id;
  return game.dungeons.getObjectByID(id) as undefined as never;
};

export const item_from_id = <TItem extends Item>(
  id: AnyItemID | TItem
): TItem => {
  if (typeof id !== "string") return id;
  return game.items.getObjectByID(id) as undefined as never;
};

export const skill_from_id = <TSkill extends AnySkill>(
  id: SkillID | TSkill
): TSkill => {
  if (typeof id !== "string") return id;
  return game.skills.getObjectByID(id) as undefined as never;
};

export class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }
}
