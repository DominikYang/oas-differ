import * as _ from "lodash";

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

function compareArray(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  let addValues = _.difference(right, left);
  let delValues = _.difference(left, right);
  // add del
  pushChanges(path, addValues, add);
  pushChanges(path, delValues, del);
}

export function compareTypes(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  if (_.isArray(left) && _.isArray(right)) {
    compareArray(path, left, right, add, del, change);
  } else if (_.isArray(left) && !_.isArray(right)) {
    let delValues = _.difference(left, [right]);
    let addValues = _.difference([right], left);
    pushChanges(path, delValues, del);
    pushChanges(path, addValues, add);
  } else if (!_.isArray(left) && _.isArray(right)) {
    let delValues = _.difference([left], right);
    let addValues = _.difference(right, [left]);
    pushChanges(path, delValues, del);
    pushChanges(path, addValues, add);
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

export function compareValues(left: any[], right: any[]) {
  let add = _.difference(right, left);
  let del = _.difference(left, right);
  let same = _.intersection(left, right);

  return {
    "add": add,
    "del": del,
    "same":same
  }  
}