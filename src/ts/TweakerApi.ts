import {
  item_from_id,
  ExtendableError,
  skill_from_id,
  dungeon_from_id
} from "./utils";

class TweakerApiError extends ExtendableError {
  constructor(msg: string) {
    super(msg);
  }
}

class TweakerApiItemError extends TweakerApiError {
  constructor(item: Item | string, quantity: number | string, verb: string) {
    super(`Failed to ${verb} ${quantity} of item ${item}`);
  }
}

class TweakerApiSkillError extends TweakerApiError {
  constructor(
    skill: AnySkill | string,
    verb: string,
    quantity?: number | string
  ) {
    super(`Failed to ${verb} ${quantity} for skill ${skill}`);
  }
}

class TweakerApiStatsError extends TweakerApiError {
  constructor(stats: EquipStatPair[]) {
    super(`Failed to add stats ${stats}`);
  }
}

class TweakerApiDungeonError extends TweakerApiError {
  constructor(dungeon: AnyDungeonOrID) {
    super(`Failed to unlock dungeon ${dungeon}`);
  }
}

type AnyItemOrID = AnyItemID | Item;
type AnyEquipmentOrID = EquipmentItemID | EquipmentItem | FoodItemID | FoodItem;
type AnySkillOrID = SkillID | AnySkill;
type AnyDungeonOrID = DungeonID | Dungeon;

export interface ITweakerApi {
  give_item(
    item: AnyItemOrID,
    quantity: number,
    log_lost: boolean,
    found: boolean,
    ignore_space?: boolean
  ): boolean;
  remove_item(
    item: AnyItemOrID,
    quantity: number,
    remove_charges: boolean
  ): void;
  equip_item(
    item: AnyEquipmentOrID,
    set: number,
    create_if_unowned?: boolean,
    slot?: SlotTypes | "Default",
    quantity?: number
  ): boolean;
  add_xp(skill: AnySkillOrID, amount: number): void;
  set_level(skill: AnySkillOrID, level: number): void;
  add_stats(stats: EquipStatPair[]): void;
  unlock_dungeon(dungeon: AnyDungeonOrID): void;
}

export default class TweakerApi implements ITweakerApi {
  give_item(
    item: AnyItemOrID,
    quantity: number,
    log_lost: boolean,
    found: boolean,
    ignore_space?: boolean | undefined,
    notify?: boolean
  ): boolean {
    try {
      return game.bank.addItem(
        item_from_id(item),
        quantity,
        log_lost,
        found,
        ignore_space,
        notify
      );
    } catch (e) {
      throw new TweakerApiItemError(item, quantity, "give");
    }
  }

  remove_item(
    item: AnyItemOrID,
    quantity: number,
    remove_item_charges: boolean
  ): void {
    try {
      game.bank.removeItemQuantity(
        item_from_id(item),
        quantity,
        remove_item_charges
      );
    } catch (e) {
      throw new TweakerApiItemError(item, quantity, "remove");
    }
  }

  #is_food_item(item: any): item is FoodItem {
    return (item_from_id(item) as FoodItem).healsFor !== undefined;
  }

  equip_item(
    item: AnyEquipmentOrID,
    set = 0,
    create_if_unowned = true,
    slot: SlotTypes | "Default" | undefined = "Default",
    quantity = 1
  ): boolean {
    try {
      const _i = item_from_id(item);
      if (create_if_unowned) {
        this.give_item(_i, quantity, false, true, true);
      }
      if (this.#is_food_item(_i))
        return game.combat.player.equipFood(_i, quantity) as boolean;
      else return game.combat.player.equipItem(_i, set, slot, quantity);
    } catch (e) {
      throw new TweakerApiItemError(item, quantity, "equip");
    }
  }

  add_xp(
    skill: AnySkillOrID,
    amount: number,
    mastery_action?: NamespacedObject
  ): void {
    try {
      skill_from_id(skill).addXP(amount, mastery_action);
    } catch (e) {
      throw new TweakerApiSkillError(skill, "add", amount.toString() + " XP");
    }
  }

  set_level(skill: AnySkillOrID, level: number): void {
    try {
      skill_from_id(skill).setXP(exp.level_to_xp(level));
    } catch (e) {
      throw new TweakerApiSkillError(skill, "set level to", level);
    }
  }

  add_stats(stats: EquipStatPair[]): void {
    try {
      game.combat.player.equipmentStats.addStats(stats);
    } catch (e) {
      throw new TweakerApiStatsError(stats);
    }
  }

  unlock_dungeon(dungeon: AnyDungeonOrID): void {
    try {
      const dung = dungeon_from_id(dungeon);
      const req =
        dung.unlockRequirement !== undefined ? dung.unlockRequirement[0] : null;
      if (req) {
        game.combat.setDungeonCompleteCount(
          req.dungeon,
          Math.max(req.count, game.combat.getDungeonCompleteCount(req.dungeon))
        );
      }
    } catch (e) {
      throw new TweakerApiDungeonError(dungeon);
    }
  }
}
