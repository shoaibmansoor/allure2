import { View } from "backbone.marionette";
import { OPTIONS } from "../../data/grouping-mode";
import { className, on } from "../../decorators";
import template from "./NodeGroupByTagView.hbs";
import "./styles.scss";


@className("grouping-mode")
class NodeGroupByTagView extends View {
  template = template;

  initialize({ settings, tabName, collection }) {
    this.settings = settings;
    this.collection = collection;
    this.show = tabName.includes('categories') && this.containsGroupByTags();
  }

  serializeData() {
    return {
      options: OPTIONS,
    };
  }

  onDestroy() {
    this.settings.setGroupingMode('default');
  }

  onRender() {
    // hide for non categories tabs or when no groupBy tags provided
    if (!this.show) {
      this.$('.grouping-mode').hide();
      this.settings.setGroupingMode('default');
      return;
    }

    const selectedValue = this.settings.getGroupingMode()
    const select = this.$('#groupby-dropdown');

    select.find('option[selected]').removeAttr('selected');
    select.find(`option[value="${selectedValue}"]`).attr('selected', 'selected');
  }

  containsGroupByTags() {
    const keyword = this.settings.getAllowedGroupingTagPrefix();
    // eslint-disable-next-line prefer-const
    let result = false;
    for (const e of this.collection.allResults) {
      for (const tag of e.tags) {
        const r = tag.includes(keyword)
        if (r) {
          result = r;
          break;
        }
      }

      if (result) {
        break;
      }
    }

    return result
  }

  @on("change #groupby-dropdown")
  onSelection(e) {
    const select = this.$(e.currentTarget);
    const selectedValue = select.val();

    select.find('option[selected]').removeAttr('selected');
    select.find(`option[value="${selectedValue}"]`).attr('selected', 'selected');
    this.settings.setGroupingMode(selectedValue);
  }
}

export default NodeGroupByTagView;
