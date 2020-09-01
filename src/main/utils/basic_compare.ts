import * as _ from "lodash";

export function compareString(path: string, location: string, key: string, property: string,
  left: string, right: string, change: any[], method: string = '') {
  if (left != right) {
    let temp = {
      "path": path,
      "method": method,
      "location": location,
      "change": {
        "key": key,
        "property": property,
        "from": left,
        "to": right
      }
    }
    change.push(temp);
  }
}

function compareArray(path: string, method: string = '', location: string, key: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
  let addValues = _.difference(right, left);
  let delValues = _.difference(left, right);
  // add del
  pushChanges(path, method, location, key, addValues, add);
  pushChanges(path, method, location, key, delValues, del);
}

export function compareArrayString(path: string, location: string, key: string, proterty: string,
  left: any, right: any,
  add: any[], del: any[], change: any[], method: string = '') {
  if (_.isArray(left) && _.isArray(right)) {
    compareArray(path, method, location, proterty, left, right, add, del, change);
  } else if (_.isArray(left) && !_.isArray(right)) {
    let delValues = _.difference(left, [right]);
    let addValues = _.difference([right], left);
    pushChanges(path, method, location, proterty, delValues, del);
    pushChanges(path, method, location, proterty, addValues, add);
  } else if (!_.isArray(left) && _.isArray(right)) {
    let delValues = _.difference([left], right);
    let addValues = _.difference(right, [left]);
    pushChanges(path, method, location, proterty, delValues, del);
    pushChanges(path, method, location, proterty, addValues, add);
  } else {
    compareString(path, location, key, proterty, left, right, change, method);
  }
}

export function pushChanges(path: string, method: string = '', location: string, key: string,
  changes: any, list: any[]) {
  if (_.isString(changes)) {
    let change = {
      "path": path,
      "method": method,
      "location": location,
      "change": {
        "value": changes
      }
    }
    list.push(change);
  } else if (_.isArray(changes) && changes.length != 0) {
    for (let i = 0; i < changes.length; i++) {
      const element = changes[i];
      let change = {
        "path": path,
        "method": method,
        "location": location,
        "change": {
          "value": element
        }
      }
      list.push(change);
    }
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

export function pushPropertyChanges(path: string, method: string, location: string, list: string[], value: any, changeList: any[]) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (value[element].hasOwnProperty('properties')) {
      dfsProperties(path, method, location + '/' + element + '/properties', value[element].properties, changeList);
    }
  }

  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    let type;
    if (value[element].hasOwnProperty('type')) {
      type = value[element]['type'];
    }
    let change = pushPropertyChange(path, method, location, element, type);
    changeList.push(change);
  }
}

export function dfsProperties(path: string, method: string, location: string,
  jsonProper: any, list: any[]) {
  let keys = Object.keys(jsonProper);
  let filterKeys = _.difference(keys, 'properties');
  pushPropertyChanges(path, method, location, filterKeys, jsonProper, list);
}

export function pushPropertyChange(path: string, method: string, location: string, value: string, type: string) {
  return {
    "path": path,
    "method": method,
    "location": location,
    "change": {
      "key": value,
      "type": type
    }
  }
}