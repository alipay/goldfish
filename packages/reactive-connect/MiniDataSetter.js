import _set from "@goldfishjs/reactive/lib/set";
import _isObservable from "@goldfishjs/reactive/lib/isObservable";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _generateKeyPathString from "@goldfishjs/reactive/lib/generateKeyPathString";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

import { isObject } from '@goldfishjs/utils';
export var Batch =
/*#__PURE__*/
function () {
  function Batch(cb) {
    _classCallCheck(this, Batch);

    this.segTotalList = [];
    this.counter = 0;
    this.cb = cb;
  }

  _createClass(Batch, [{
    key: "set",
    value: function set() {
      return __awaiter(this, void 0, void 0,
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee() {
        var segIndex, segLength;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                segIndex = this.counter === 0 ? this.segTotalList.length : this.segTotalList.length - 1;

                if (!this.segTotalList[segIndex]) {
                  this.segTotalList[segIndex] = 0;
                }

                this.counter += 1;
                this.segTotalList[segIndex] += 1;
                _context.next = 6;
                return Promise.resolve();

              case 6:
                this.counter -= 1; // The last invoke of `set`

                if (!(this.counter === 0)) {
                  _context.next = 12;
                  break;
                }

                segLength = this.segTotalList.length;
                _context.next = 11;
                return Promise.resolve();

              case 11:
                if (this.segTotalList.length === segLength) {
                  this.cb();
                  this.counter = 0;
                  this.segTotalList = [];
                }

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
    }
  }]);

  return Batch;
}();

var Ancestor = function Ancestor() {
  _classCallCheck(this, Ancestor);

  this.parent = undefined;
  this.children = undefined;
};

var Leaf = function Leaf() {
  _classCallCheck(this, Leaf);

  this.parent = undefined;
};

var LimitLeafCounter =
/*#__PURE__*/
function () {
  function LimitLeafCounter() {
    _classCallCheck(this, LimitLeafCounter);

    this.limitLeafTotalCount = 100;
    this.leafTotalCount = 0;
  }

  _createClass(LimitLeafCounter, [{
    key: "addLeaf",
    value: function addLeaf() {
      this.leafTotalCount += 1;
    }
  }, {
    key: "getRemainCount",
    value: function getRemainCount() {
      return this.limitLeafTotalCount - this.leafTotalCount;
    }
  }]);

  return LimitLeafCounter;
}();

var UpdateTree =
/*#__PURE__*/
function () {
  function UpdateTree(view, limitLeafTotalCount) {
    _classCallCheck(this, UpdateTree);

    this.root = new Ancestor();
    this.view = view;
    this.limitLeafTotalCount = limitLeafTotalCount;
  }

  _createClass(UpdateTree, [{
    key: "addNode",
    value: function addNode(keyPathList, value) {
      var curNode = this.root;
      var len = keyPathList.length;
      keyPathList.forEach(function (keyPath, index) {
        if (curNode.children === undefined) {
          if (typeof keyPath === 'number') {
            curNode.children = [];
          } else {
            curNode.children = {};
          }
        }

        if (index < len - 1) {
          var child = curNode.children[keyPath];

          if (!child || child instanceof Leaf) {
            var node = new Ancestor();
            node.parent = curNode;
            curNode.children[keyPath] = node;
            curNode = node;
          } else {
            curNode = child;
          }
        } else {
          var lastLeafNode = new Leaf();
          lastLeafNode.parent = curNode;
          lastLeafNode.value = value;
          curNode.children[keyPath] = lastLeafNode;
        }
      });
    }
  }, {
    key: "getViewData",
    value: function getViewData(viewData, k) {
      return isObject(viewData) ? viewData[k] : null;
    }
  }, {
    key: "combine",
    value: function combine(curNode, viewData) {
      var _this = this;

      if (curNode instanceof Leaf) {
        return curNode.value;
      }

      if (!curNode.children) {
        return undefined;
      }

      if (Array.isArray(curNode.children)) {
        return curNode.children.map(function (child, index) {
          return _this.combine(child, _this.getViewData(viewData, index));
        });
      }

      var result = isObject(viewData) ? viewData : {};

      for (var k in curNode.children) {
        result[k] = this.combine(curNode.children[k], this.getViewData(viewData, k));
      }

      return result;
    }
  }, {
    key: "iterate",
    value: function iterate(curNode, keyPathList, updateObj, viewData, availableLeafCount) {
      var _this2 = this;

      if (curNode instanceof Leaf) {
        updateObj[_generateKeyPathString(keyPathList)] = curNode.value;
        this.limitLeafTotalCount.addLeaf();
      } else {
        var children = curNode.children;
        var len = Array.isArray(children) ? children.length : Object.keys(children || {}).length;

        if (len > availableLeafCount) {
          updateObj[_generateKeyPathString(keyPathList)] = this.combine(curNode, viewData);
          this.limitLeafTotalCount.addLeaf();
        } else if (Array.isArray(children)) {
          children.forEach(function (child, index) {
            _this2.iterate(child, [].concat(_toConsumableArray(keyPathList), [index]), updateObj, _this2.getViewData(viewData, index), _this2.limitLeafTotalCount.getRemainCount() - len);
          });
        } else {
          for (var k in children) {
            this.iterate(children[k], [].concat(_toConsumableArray(keyPathList), [k]), updateObj, this.getViewData(viewData, k), this.limitLeafTotalCount.getRemainCount() - len);
          }
        }
      }
    }
  }, {
    key: "generate",
    value: function generate() {
      var updateObj = {};
      this.iterate(this.root, [], updateObj, this.view.data, this.limitLeafTotalCount.getRemainCount());
      return updateObj;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.root = new Ancestor();
    }
  }]);

  return UpdateTree;
}();

var Updater =
/*#__PURE__*/
function () {
  function Updater() {
    _classCallCheck(this, Updater);

    this.list = [];
    this.limitLeafCounter = new LimitLeafCounter();
  }

  _createClass(Updater, [{
    key: "setSetObjectValue",
    value: function setSetObjectValue(view, keyPathList, value) {
      var last = this.list[this.list.length - 1];

      if (!last || !(last instanceof UpdateTree)) {
        last = new UpdateTree(view, this.limitLeafCounter);
        this.list.push(last);
      }

      last.addNode(keyPathList, value);
    }
  }, {
    key: "setSpliceObjectValue",
    value: function setSpliceObjectValue(keyPathList, args) {
      var last = this.list[this.list.length - 1];

      if (!last || last instanceof UpdateTree) {
        last = {};
        this.list.push(last);
      }

      var key = typeof keyPathList === 'string' ? keyPathList : _generateKeyPathString(keyPathList);
      last[key] = args;
    }
  }, {
    key: "iterate",
    value: function iterate(fn) {
      this.list.forEach(function (item) {
        if (item instanceof UpdateTree) {
          fn('set', item.generate());
        } else {
          fn('splice', item);
        }
      });
    }
  }]);

  return Updater;
}();

var MiniDataSetter =
/*#__PURE__*/
function () {
  function MiniDataSetter() {
    var _this3 = this;

    _classCallCheck(this, MiniDataSetter);

    this.count = new Batch(function () {
      return _this3.flush();
    });
    this.viewMap = {};
    this.updaterMap = {};
  }

  _createClass(MiniDataSetter, [{
    key: "getBatchUpdates",
    value: function getBatchUpdates(view) {
      return view.$batchedUpdates ? view.$batchedUpdates.bind(view) : view.$page.$batchedUpdates.bind(view.$page);
    }
  }, {
    key: "flush",
    value: function flush() {
      if (this.updaterFns) {
        for (let id in this.updaterFns) {
          const view = this.viewMap[id];
          const fns = this.updaterFns[id];
          this.getBatchUpdates(view)(() => {
            fns.forEach(fn => fn());
          });
        }
        this.updaterFns = null;
      }
    }
  }, {
    key: "setValue",
    value: function setValue(obj, key, value) {
      if (_isObservable(obj)) {
        _set(obj, key, value, {
          silent: true
        });
      } else {
        obj[key] = value;
      }
    }
  }, {
    key: "setByKeyPathList",
    value: function setByKeyPathList(obj, keyPathList, value) {
      if (keyPathList.length === 0) {
        throw new TypeError('No key path.');
      }

      for (var i = 0, il = keyPathList.length, curObj = obj; true; i += 1) {
        var key = keyPathList[i]; // The last one.

        if (i === il - 1) {
          this.setValue(curObj, key, value);
          break;
        }

        if (!curObj[key] && i < il) {
          this.setValue(curObj, key, typeof key === 'number' ? [] : {});
        }

        curObj = curObj[key];
      }
    }
  }, {
    key: "set",
    value: function set(view, keyPathList, newV, oldV, options) {
      if (!this.updaterFns) {
        this.updaterFns = {};
        this.viewMap = {};
      }

      this.viewMap[view.$id] = view;
      this.updaterFns[view.$id] = this.updaterFns[view.$id] || [];

      try {
        var keyPathString = _generateKeyPathString(keyPathList);

        if (Array.isArray(newV) && Array.isArray(oldV)) {
          if (!options || !options.method) {
            // Use `splice` to update the whole array when there is an new array set.
            this.updaterFns[view.$id].push(() => {
              view.setData({
                [keyPathString]: newV,
              });
            });
            // this.updaterMap[view.$id].setSpliceObjectValue(keyPathString, [0, oldV.length].concat(_toConsumableArray(newV)));
          } else {
            var methodName = options && options.method;
            /* eslint-disable @typescript-eslint/no-non-null-assertion */

            var args = options && options.args;
            var optionsOldV = options && options.oldV;
            /* eslint-enable @typescript-eslint/no-non-null-assertion */

            this.setByKeyPathList(view.data, keyPathList, options.oldV);
            var map = {
              push: [optionsOldV.length, 0].concat(_toConsumableArray(args)),
              splice: args,
              unshift: [0, 0].concat(_toConsumableArray(args)),
              pop: [optionsOldV.length - 1, 1],
              shift: [0, 1]
            };
            var spliceDataArgs = map[methodName];

            if (spliceDataArgs) {
              this.updaterFns[view.$id].push(() => {
                view.$spliceData({
                  [keyPathString]: spliceDataArgs,
                });
              });
            } else {
              this.updaterFns[view.$id].push(() => {
                view.setData({
                  [keyPathString]: newV,
                });
              });
            }
          }
        } else {
          this.updaterFns[view.$id].push(() => {
            view.setData({
              [keyPathString]: newV,
            });
          });
        }
      } catch (e) {
        this.updaterFns[view.$id].push(() => {
          view.setData({
            [keyPathList[0]]: view.data[keyPathList[0]],
          });
        });
        console.warn(e);
      }

      this.count.set();
    }
  }]);

  return MiniDataSetter;
}();

export { MiniDataSetter as default };
