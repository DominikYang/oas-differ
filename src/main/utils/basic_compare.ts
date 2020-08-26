import * as _ from "lodash";

export function compareString(path: string, location: string, key: string,
  left: string, right: string, change: any[], method: string = '') {
  if (left != right) {
    let temp = {
      "path": path,
      "method": method,
      "location": location,
      "change": {
        "key": key,
        "from": left,
        "to": right
      }
    }
    change.push(temp);
  }
}

function compareArray(path: string,method:string = '',location:string,key:string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  let addValues = _.difference(right, left);
  let delValues = _.difference(left, right);
  // add del
  pushChanges(path,method,location, addValues, add);
  pushChanges(path,method,location, delValues, del);
}

export function compareTypes(path: string, location: string, key: string,
  left: any, right: any,
  add: any[], del: any[], change: any[], method: string = '') {
  if (_.isArray(left) && _.isArray(right)) {
    compareArray(path,method,location,key, left, right, add, del, change);
  } else if (_.isArray(left) && !_.isArray(right)) {
    let delValues = _.difference(left, [right]);
    let addValues = _.difference([right], left);
    pushChanges(path,method,location,delValues, del);
    pushChanges(path,method,location, addValues, add);
  } else if (!_.isArray(left) && _.isArray(right)) {
    let delValues = _.difference([left], right);
    let addValues = _.difference(right, [left]);
    pushChanges(path,method,location, delValues, del);
    pushChanges(path,method,location, addValues, add);
  } else {
    compareString(path, location, key, left, right, change, method);
  }
}

export function pushChanges(path: string, method: string = '', location: string, changes: any, list: any[]) {
  if ((_.isArray(changes) && changes.length != 0) || (_.isString(changes) && changes != null)) {
    let change = {
      "path": path,
      "method": method,
      "location": location,
      "change": changes
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
    "same": same
  }
}