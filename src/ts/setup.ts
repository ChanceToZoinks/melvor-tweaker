import ModService from "./ModService";
import Data from "../data/data.json";

import "../css/styles.css";
import Icon from "../img/icon.png";
import LargeIcon from "../img/icon_large.png";

export async function setup(ctx: ModContext) {
  ModService.init(
    ctx,
    {
      icon_url: ctx.getResourceUrl(Icon),
      icon_url_large: ctx.getResourceUrl(LargeIcon),
      log_prefix: "Tweaker",
      create_sidebar: true,
      sidebar_category_name: "Tweaker",
      sidebar_item_name: "Open Tweaker menu"
    },
    [Data]
  );
}
