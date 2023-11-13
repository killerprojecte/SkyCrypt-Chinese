import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as helper from "../../../../common/helper.js";
import { STATS_DATA } from "../../../../common/constants.js";

@customElement("player-stat")
export class PlayerStat extends LitElement {
  @property({ attribute: "stat" })
  stat?: StatName;

  @property({ attribute: "value" })
  value?: string;

  @property({ attribute: false })
  data = {};

  @property({ attribute: false })
  special = {};

  protected render(): TemplateResult | undefined {
    if (!this.stat || !this.value) {
      return;
    }

    const value = Math.round(+this.value);
    const icon = STATS_DATA[this.stat].symbol;
    const name = STATS_DATA[this.stat].nameShort;
    const suffix = STATS_DATA[this.stat].suffix;

    const tooltip = this.getTooltip(this.data, name, suffix, value, this.special);

    return html`
      <div data-stat="${this.stat}" class="basic-stat stat-${this.stat.replaceAll("_", "-")}">
        <div data-tippy-content="${tooltip.join("")}">
          <span class="stat-icon">${icon}</span>
          <span class="stat-name">${name}</span>
          <span class="stat-value">${value.toLocaleString()}${suffix}</span>
        </div>
      </div>
    `;
  }

  private getTooltip(
    data: { [key: string]: number },
    name: string | undefined,
    suffix: string,
    value: number,
    special: { [key: string]: number } | undefined
  ): string[] {
    const tooltip: string[] = [];
    const tooltipBonus: string[] = [];

    if (!name) {
      return tooltip;
    }

    tooltip.push(
      `<span class="stat-name">基础 ${name}: </span>`,
      `<span class="stat-value">${helper.round(data.base, 1).toLocaleString()}${suffix}</span>`,
      "<br/>",
      "<span class='tippy-explanation'>每个玩家在 SkyBlock 冒险开始时都有的基础值!</span>"
    );

    if (value - data.base > 0) {
      for (const [key, val] of Object.entries(data)) {
        if (key === "base" || typeof val !== "number") {
          continue;
        }

        tooltipBonus.push(
          `- ${this.getPrettyDataName(key)} ${val < 0 ? "" : "+"}${helper.round(val, 1).toLocaleString()}${suffix}`
        );
      }

      tooltip.push(
        "<br/>",
        "<br/>",
        `<span class="stat-name">额外 ${name}: </span>`,
        `<span class="stat-value">${helper.round(value - data.base, 1).toLocaleString()}${suffix}</span>`,
        "<br/>",
        `<span class='tippy-explanation'>额外增益来自: <br>${tooltipBonus.join("<br>")}</span>`
      );
    }

    if (special && Object.keys(special).length > 0) {
      tooltip.push("<br/>");
      for (const [key, val] of Object.entries(special)) {
        tooltip.push("<br/>", `<span class="stat-name">${key}: </span>`, `<span class="stat-value">${val}</span>`);
      }
    }

    return tooltip;
  }

  private getPrettyDataName(key: string): string {
    let name = key.replaceAll("_", " ");

    switch (name) {
      case "pet":
        name = "使用的宠物";
        break;
      case "held item":
        name = "手持的物品";
        break;
    }

    return helper.titleCase(name);
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "player-stat": PlayerStat;
  }
}
