import { View } from "backbone.marionette";
import { DEFAULT_OPTIONS_GROUPING_MODE } from "../../data/grouping-mode";
import getComparator from "../../data/tree/comparator";
import { byCriteria, byMark, byStatuses, mix } from "../../data/tree/filter";
import { behavior, className, on } from "../../decorators";
import router from "../../router";
import hotkeys from "../../utils/hotkeys";
import { SEARCH_QUERY_KEY } from "../node-search/NodeSearchView";
import template from "./TreeView.hbs";
import "./styles.scss";


@className("tree")
@behavior("TooltipBehavior", { position: "bottom" })
class TreeView extends View {
  template = template;

  cachedQuery = "";
  initialize({ routeState, state, tabName, baseUrl, settings }) {
    this.state = state;
    this.routeState = routeState;
    this.baseUrl = baseUrl;
    this.tabName = tabName;
    this.rootname = null;

    this.setState();
    this.listenTo(this.routeState, "change:treeNode", this.selectNode);
    this.listenTo(this.routeState, "change:testResultTab", this.render);

    this.settings = settings;
    this.listenTo(this.settings, "change", this.render);
    this.listenTo(this.state, "change", this.handleStateChange);

    this.listenTo(hotkeys, "key:up", this.onKeyUp, this);
    this.listenTo(hotkeys, "key:down", this.onKeyDown, this);
    this.listenTo(hotkeys, "key:esc", this.onKeyBack, this);
    this.listenTo(hotkeys, "key:left", this.onKeyBack, this);
  }

  applyFilters() {
    const visibleStatuses = this.settings.getVisibleStatuses();
    const visibleMarks = this.settings.getVisibleMarks();
    const searchQuery = this.state.get(SEARCH_QUERY_KEY);
    const filter = mix(byCriteria(searchQuery), byStatuses(visibleStatuses), byMark(visibleMarks));

    const sortSettings = this.settings.getTreeSorting();
    const sorter = getComparator(sortSettings);

    this.collection.applyFilterAndSorting(filter, sorter);
  }

  setState() {
    const treeNode = this.routeState.get("treeNode");
    if (treeNode && treeNode.testResult) {
      const uid = treeNode.testResult;
      this.state.set(uid, true);
    }
    if (treeNode && treeNode.testGroup) {
      const uid = treeNode.testGroup;
      this.state.set(uid, true);
    }
  }

  onBeforeRender() {
    this.applyFilters();
  }

  handleStateChange() {
    const query = this.state.get(SEARCH_QUERY_KEY);
    // need to check this ot to re-render nodes on folding
    if (query !== this.cachedQuery) {
      this.cachedQuery = query;
      this.render();
    }
  }

  onRender() {
    this.selectNode();
    if (this.state.get(SEARCH_QUERY_KEY)) {
      this.$(".node__title").each((i, node) => {
        this.$(node)
          .parent()
          .addClass("node__expanded");
      });
    } else {
      this.restoreState();
    }
  }

  selectNode() {
    const previous = this.routeState.previous("treeNode");
    this.toggleNode(previous, false);
    const current = this.routeState.get("treeNode");
    this.toggleNode(current, true);
    this.restoreState();
  }

  toggleNode(node, active = true) {
    if (node) {
      const el = this.findElement(node);
      el.toggleClass("node__title_active", active);
      this.changeState(node.testResult);
      this.changeState(node.testGroup);
    }
  }

  changeState(uid, active = true) {
    if (active) {
      this.state.set(uid, true);
    } else {
      this.state.unset(uid);
    }
  }

  restoreState() {
    this.$("[data-uid]").each((i, node) => {
      const el = this.$(node);
      const uid = el.data("uid");
      el.toggleClass("node__expanded", this.state.has(uid));
    });
    this.$(".node__title_active")
      .parents(".node")
      .toggleClass("node__expanded", true);
    if (this.$(".node").parents(".node__expanded").length > 0) {
      this.$(".node__expanded")
        .parents("div.node.node__expanded")
        .toggleClass("node__expanded", true);
    } else {
      this.$(".node__expanded")
        .parents(".node")
        .toggleClass("node__expanded", true);
    }
  }

  findElement(treeNode) {
    if (treeNode.testResult && this.rootname) {
      const rootname = `[data-rootname='${this.rootname}']`;
      return this.$(`[data-uid='${treeNode.testResult}'][data-parentUid='${treeNode.testGroup}']${rootname}`);
    } else if (treeNode.testResult) {
      return this.$(`[data-uid='${treeNode.testResult}'][data-parentUid='${treeNode.testGroup}']`);
    } else {
      return this.$(`[data-uid='${treeNode.testGroup}']`);
    }
  }

  @on("click .node__title")
  onNodeClick(e) {
    const node = this.$(e.currentTarget);
    const uid = node.data("uid");
    const clickedRootname = node.data("rootname");

    // set rootname for finding element
    if (clickedRootname) {
      this.rootname = clickedRootname;
    }

    this.changeState(uid, !this.state.has(uid));
    node.parent().toggleClass("node__expanded");
  }

  onKeyUp(event) {
    event.preventDefault();
    const current = this.routeState.get("treeNode");
    if (current && current.testResult) {
      this.selectTestResult(this.collection.getPreviousTestResult(current.testResult));
    } else {
      this.selectTestResult(this.collection.getLastTestResult());
    }
  }

  onKeyDown(event) {
    event.preventDefault();
    const current = this.routeState.get("treeNode");
    if (current && current.testResult) {
      this.selectTestResult(this.collection.getNextTestResult(current.testResult));
    } else {
      this.selectTestResult(this.collection.getFirstTestResult());
    }
  }

  onKeyBack(event) {
    event.preventDefault();
    const current = this.routeState.get("treeNode");
    if (!current) {
      return;
    }
    if (current.testGroup && current.testResult) {
      if (this.routeState.get("attachment")) {
        router.setSearch({ attachment: null });
      } else {
        router.toUrl(`${this.baseUrl}/${current.testGroup}`);
      }
    } else if (current.testGroup) {
      router.toUrl(`${this.baseUrl}`);
    }
  }

  selectTestResult(testResult) {
    if (testResult) {
      const tab = this.routeState.get("testResultTab") || "";
      router.toUrl(`${this.baseUrl}/${testResult.parentUid}/${testResult.uid}/${tab}`, {
        replace: true,
      });
    }
  }

  onDestroy() {
    this.rootname = null;
  }

  transformGroupedData(groupedData) {
    const transformedData = [];

    for (const tag in groupedData) {
      if (Object.prototype.hasOwnProperty.call(groupedData, tag)) {
        const group = {
          name: tag,
          children: [],
          uid: null,
          statistic: {
            broken: 0,
            failed: 0,
            passed: 0,
            skipped: 0,
            unknown: 0,
          },
          time: {
            duration: 0,
            maxDuration: 0,
            minDuration: 0,
            start: 0,
            stop: 0,
            sumDuration: 0,
          }
        };

        for (const obj of groupedData[tag]) {
          const item = obj.ancestor;
          group.children.push(item);
          group.uid = this.generateUID();

          group.statistic.broken += item.statistic.broken;
          group.statistic.failed += item.statistic.failed;
          group.statistic.passed += item.statistic.passed;
          group.statistic.skipped += item.statistic.skipped;
          group.statistic.unknown += item.statistic.unknown;

          group.time.duration += item.time.duration;
          group.time.maxDuration += item.time.maxDuration;
          group.time.minDuration += item.time.minDuration;
          group.time.start += item.time.start;
          group.time.stop += item.time.stop;
          group.time.sumDuration += item.time.sumDuration;
        }

        transformedData.push(group);
      }
    }

    return transformedData;
  }

  generateUID() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function(c) {
      const r = Math.floor(Math.random() * 16); // Use Math.floor instead of bitwise
      const v = c === 'x' ? r : (r % 4 + 8); // Use strict equality and avoid bitwise
      return v.toString(16);
    });
  }

  groupByTags() {
    const data = this.collection.toJSON()[0];
    const grouped = {};
    this.groupAncestorsByTags(data, grouped);
    const addParentCategoryToChilds = this.transformGroupedData(grouped);
    return addParentCategoryToChilds;
  }

  groupAncestorsByTags(node, groupedData = {}, parent = null, grandParent = null) {
    // if the node is undefined
    if (!node) {
      return;
    }

    // If the current node has tags, it's a leaf node we want
    if (node.tags && node.tags.length > 0 && parent && grandParent) {
      const allowedPrefix = this.settings.getAllowedGroupingTagPrefix();

      for (const tag of node.tags) {
        if (!tag.startsWith(allowedPrefix)) {
          continue;
        }

        if (!groupedData[tag]) {
          groupedData[tag] = [];
        }
        // Create an object containing both grandParent's UID and the parent (ancestor) object
        const ancestorInfo = {
          grandParentUid: grandParent.uid,
          ancestor: parent
        };
        // Add the ancestorInfo object to the tag's list if not already included
        if (!groupedData[tag].some(item => item.ancestor.uid === parent.uid)) {
          groupedData[tag].push(ancestorInfo);
        }
      }
    }

    // If the node has children, recursively call this function on each child
    // Pass the current node as the parent and the current parent as the grandparent
    if (node.children) {
      node.children.forEach(child => {
        this.groupAncestorsByTags(child, groupedData, node, parent);
      });
    }
  }

  templateContext() {
    const isGroupingEnabled = !DEFAULT_OPTIONS_GROUPING_MODE.includes(this.settings.getGroupingMode());

    return {
      cls: this.className,
      baseUrl: this.baseUrl,
      showGroupInfo: this.settings.isShowGroupInfo(),
      time: this.collection.time,
      statistic: this.collection.statistic,
      uid: this.collection.uid,
      tabName: this.tabName,
      items: this.collection.toJSON(),
      testResultTab: this.routeState.get("testResultTab") || "",
      isGroupingModeEnabled: isGroupingEnabled,
      groupedData: this.groupByTags(),
    };
  }
}

export default TreeView;
