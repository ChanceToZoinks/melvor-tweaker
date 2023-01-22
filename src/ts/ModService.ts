import { Logger } from "./Logger";

export interface IModServiceInternalData {
  icon_url: string;
  icon_url_large: string;
  sidebar_category_name?: string;
  sidebar_item_name?: string;
}

export class ModServiceInternalData implements IModServiceInternalData {
  #icon_url: string;
  #icon_url_large: string;
  #sidebar_category_name?: string;
  #sidebar_item_name?: string;

  constructor(cfg: IModServiceInternalData) {
    ({
      icon_url: this.#icon_url,
      icon_url_large: this.#icon_url_large,
      sidebar_category_name: this.#sidebar_category_name,
      sidebar_item_name: this.#sidebar_item_name
    } = cfg);
  }

  get icon_url() {
    return this.#icon_url;
  }

  get icon_url_large() {
    return this.#icon_url_large;
  }

  get logo_html() {
    return `<img class="mod-template__logo-img" src="${this.icon_url_large}" />`;
  }

  get sidebar_category_name() {
    return this.#sidebar_category_name;
  }

  get sidebar_item_name() {
    return this.#sidebar_item_name;
  }
}

export type ModServiceConfig<TCreateSidebar = boolean> =
  (TCreateSidebar extends true
    ? {
        create_sidebar: TCreateSidebar;
        sidebar_category_name: string;
        sidebar_item_name: string;
      }
    : { create_sidebar?: TCreateSidebar }) & {
    icon_url: string;
    icon_url_large: string;
    log_prefix: string;
  };

/** Gamemodes, custom items, etc -- anything that would be loaded from a .json file */
export type ModCustomGameData = string | GameDataPackage;

export default class ModService extends Logger {
  #ctx: ModContext;
  #data: ModServiceInternalData;

  private constructor(ctx: ModContext, cfg: ModServiceConfig) {
    super(cfg.log_prefix);
    this.#ctx = ctx;
    this.#data = new ModServiceInternalData(cfg);
  }

  async #try_load_gamedata<
    TData extends ModCustomGameData | ModCustomGameData[]
  >(data: TData) {
    try {
      if (Array.isArray(data)) {
        const self = this;
        data.forEach(async (pack: ModCustomGameData) => {
          self.log(`Loading package ${Object(pack).name}`);
          self.#ctx.gameData.addPackage(pack).then((_c) => {
            self.log("Succesfully loaded package");
          });
        });
      } else {
        this.log(`Loading package ${Object(data).name}`);
        await this.#ctx.gameData.addPackage(data);
      }
    } catch (e) {
      this.error("Failed to load game data package", e);
    }
  }

  #sidebar_init(cfg: ModServiceConfig) {
    if (cfg.create_sidebar) {
      this.log("Creating sidebar...");
      const self = this;
      sidebar.category(
        cfg.sidebar_category_name,
        { before: "Combat", toggleable: false },
        (bar) => {
          bar.item(cfg.sidebar_item_name, {
            icon: this.#data.icon_url,
            onClick() {
              // put your stuff here -- maybe a menu modal?
              self.log("You clicked the sidebar!");
              SwalLocale.fire({
                iconHtml: self.#data.logo_html,
                title: "Congratulations!",
                text: "You clicked the sidebar!",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yay!"
              });
            }
          });
        }
      );
    }
  }

  static init(
    ctx: ModContext,
    cfg: ModServiceConfig,
    dat: ModCustomGameData[] = []
  ) {
    const service = new ModService(ctx, cfg);

    service.log("Intializing...");
    service.log("Trans rights are human rights.");

    service.#try_load_gamedata(dat);

    service.#ctx.onInterfaceReady((_c) => {
      if (cfg.create_sidebar) service.#sidebar_init(cfg);
    });
  }
}
