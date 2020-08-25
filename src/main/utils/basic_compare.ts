import * as _ from "lodash";
import { Change } from "./change";

export function compareString(path: string,
  left: string, right: string, change: any[]) {
  if (left != right) {
    let temp = {
      "path": path,
      "change": {
        "left": left,
        "right": right
      }
    }
    change.push(temp);
  }
}

function compareValue(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
}

function compareArray(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  let addValues = _.difference(right, left);
  let delValues = _.difference(left, right);
  //TODO add del
}

export function compareTypes(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  if (_.isArray(left) && _.isArray(right)) {
    compareArray(path, left, right, add, del, change);
  } else if (_.isArray(left) && !_.isArray(right)) {
    //TODO
  } else if (!_.isArray(left) && _.isArray(right)) {
    //TODO
  } else {
    compareString(path, left, right, change);
  }
}

export function pushChanges(path: string, changes: any, list: any[]) {
  if ((_.isArray(changes) && changes.length != 0) ||(_.isString(changes) && changes != null)) {
    let change = {
      "path": path,
      "value":changes
    }
    list.push(change);
  }
}