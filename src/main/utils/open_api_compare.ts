import * as  _ from "lodash";
import { compareString, compareTypes, pushChanges, compareValues } from "./basic_compare";
import { operationObjectIgnore, parameterObjectIgnore, mediaTypeObjectIgnore } from "./ignore";
import { method } from "lodash";




export function compareOpenApi(left: any, right: any) {
  let add = [], del = [], change = [];
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = keys.same;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'paths') {
      //compare paths
      comparePaths('', left[element], right[element], [], add, del, change);
    }
  }

  return {
    "add": add,
    "del": del,
    "change": change
  }
}


function comparePaths(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameApi = keys.same;

  for (let i = 0; i < sameApi.length; i++) {
    const element = sameApi[i];
    compareMethods(path + element,
      left[element], right[element],
      [], add, del, change);
  }
  pushChanges(path, '', 'paths', keys.add, add);
  pushChanges(path, '', 'paths', keys.del, del);
}

function compareMethods(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameMethods = _.difference(keys.same,ignore);


  for (let i = 0; i < sameMethods.length; i++) {
    const element = sameMethods[i];
    //FIXME unsupported externalDocs servers callbacks security
    if (element == 'get' || element == 'put' || element == 'post' || element == 'delete' ||
      element == 'options' || element == 'head' || element == 'patch' || element == 'trace') {
      compareMethod(path, '' + element, '', left[element], right[element], operationObjectIgnore, add, del, change);
    } else if (element == 'parameters') {
      compareParameters(path, '', '', left[element], right[element], parameterObjectIgnore, add, del, change);
    } else if (element == 'summary' || element == 'description' || element == 'operatinId' || element == 'deprecated') {
      compareString(path, '', element, left[element], right[element], change);
    }
  }

  pushChanges(path, '', '/', keys.add, add);
  pushChanges(path, '', '/', keys.del, del);
}

function compareMethod(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'summary' || element == 'description') {
      compareString(path, '', element, left[element], right[element], change, method);
    }
    else if (element == 'requestBody') {
      compareRquestBody(path, method, location + '/' + element, left[element], right[element], ['description'], add, del, change);
    }
    else if (element == 'parameters') {
      compareParameters(path, method, location + '/' + element, left[element], right[element], parameterObjectIgnore, add, del, change);
    }
    else if (element == 'responses') {
      compareResponses(path, method, location + '/' + element, left[element], right[element], [], add, del, change);
    }
    else if (element == 'tags') {
      //TODO
      //compareTags(path + '/' + element, left[element], right[element], [], add, del, change);
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}


function compareParameters(path: string, method: string, location: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  if (left == undefined && right != undefined) {
    // add
    pushChanges(path, method, location, right, add);
  } else if (left != undefined && right == undefined) {
    // del
    pushChanges(path, method, location, left, del);
  } else if (left != undefined && right != undefined) {
    let leftNames = [];
    let rightNames = [];
    for (let i = 0; i < left.length; i++) {
      if (left[i].hasOwnProperty("name")) {
        leftNames.push(left[i].name);
      }
    }
    for (let i = 0; i < right.length; i++) {
      if (right[i].hasOwnProperty("name")) {
        rightNames.push(right[i].name);
      }
    }

    let compares = compareValues(leftNames, rightNames);
    pushChanges(path, method, location, compares.add, add);
    pushChanges(path, method, location, compares.del, del);
    let leftMap = new Map<string, number>();
    for (let i = 0; i < left.length; i++) {
      if (left[i].hasOwnProperty("name")) {
        if (_.includes(compares.same, left[i].name)) {
          leftMap.set(left[i].name, i);
        }
      }
    }

    let rightMap = new Map<string, number>();
    for (let i = 0; i < right.length; i++) {
      if (right[i].hasOwnProperty("name")) {
        if (_.includes(compares.same, right[i].name)) {
          rightMap.set(right[i].name, i);
        }
      }
    }

    for (let i = 0; i < compares.same.length; i++) {
      const element = compares.same[i];
      compareParameter(path, method, location + '/' + element,
        left[leftMap.get(element)], right[rightMap.get(element)],
        ignore, add, del, change);
    }
  }
}

function compareParameter(path: string, method: string, location: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  // console.log(sameKeys);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'in' || element == 'description' || element == 'required'
      || element == 'deprecated' || element == 'allowEmptyValue') {
      compareString(path, location, element, left[element], right[element], change, method);
    }
    else if (element == 'schema') {
      compareSchema(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareRquestBody(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'description' || element == 'required') {
      compareString(path, location, element, left[element], right[element], change, method);
    }
    if (element == 'content') {
      //compare contents
      compareContents(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareResponses(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  // compare ResponseObject
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareResponse(path, method, location + '/' + element, left[element], right[element],
      ['description'], add, del, change);
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareContent(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  //filter ignore keys;
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'schema') {
      //compare schema
      compareSchema(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'example') {
      //FIXME compare example
    }
    else if (element == 'examples') {
      //FIXME compare examples
    }
    else if (element == 'encoding') {
      //FIXME compare encoding
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}


function compareSchema(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'type') {
      compareTypes(path, location, element, left[element], right[element], add, del, change,method);
    }
    else if (element == 'oneOf' || element == 'allOf' || element == 'anyOf' || element == 'not') {
      // 万一有一边的schma为空？
      compareSchemas(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'properties') {
      compareProperties(path, method, location + '/' + element,
        left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'description') {
      compareString(path, location, element, left[element], right[element], change, method);
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareSchemas(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  // 如果oneof/allof/anyof/not允许不是数组的话，这么比较会出问题
  // 万一有一边的schma为空？
  if (_.isArray(left) && _.isArray(right)) {
    let minLength = Math.min(left.length, right.length);
    for (let i = 0; i < minLength; i++) {
      compareSchema(path, method, location, left[i], right[i], ignore, add, del, change);
    }
  } else if (_.isObject(left) && _.isObject(right)) {
    compareSchema(path, method, location, left, right, ignore, add, del, change);
  } else if (_.isObject(left) && _.isArray(right)) {
    compareSchema(path, method, location, left, right[0], ignore, add, del, change);
  } else if (_.isArray(left) && _.isArray(right)) {
    compareSchema(path, method, location, left[0], right, ignore, add, del, change);
  }
}

function compareResponse(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    //TODO unsupported links
    if (element == 'description') {
      compareString(path, location, element, left.description, right.description, change, method);
    }
    else if (element == 'headers') {
      //compare headers
      compareHeaders(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'content') {
      //compare contents
      compareContents(path, method, location + '/' + element, left.content, right.content, ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareContents(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareContent(path, method, location, left[element], right[element],
      mediaTypeObjectIgnore, add, del, change);
  }
  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareProperties(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  let addKeys = keys.add;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareProperty(path, method, location, left[element], right[element], ignore, add, del, change);
  }

  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);

}

function compareProperty(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    // 暂时只比较type change，忽略其它
    if (element == 'type') {
      compareTypes(path, location, element, left[element], right[element], add, del, change,method);
    }
    if (element == 'properties') {
      // 不需要加properties，把所有结果放在同一层
      compareProperties(path, method, location, left[element], right[element], ignore, add, del, change);
    }
  }

  //如果删除或者添加了一个properties类型的元素，则需要递归展开子层，把节点都添加进去
  if (_.includes(keys.add, 'properties')) {
    dfsProperties(path, method, location, right.properties, add);
  }
  if (_.includes(keys.del, 'properties')) {
    dfsProperties(path, method, location, left.properties, del);
  }

  pushChanges(path, method, location, _.difference(keys.add, 'properties'), add);
  pushChanges(path, method, location, _.difference(keys.del, 'properties'), del);
}

function dfsProperties(path: string, method: string, location: string,
  jsonProper: any, list: any[]) {
  let keys = Object.keys(jsonProper);
  let filterKeys = _.difference(keys, 'properties');
  pushChanges(path, method, location, filterKeys, list);
  if (_.includes(keys, 'properties')) {
    dfsProperties(path, method, location, jsonProper.properties, list);
  }
}

function compareHeaders(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareParameter(path, method, location + '/' + element, left[element], right[element], ignore, add, del, change);
  }
  pushChanges(path, method, location, keys.add, add);
  pushChanges(path, method, location, keys.del, del);
}

function compareTags(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let values = compareValues(left, right);
  //pushChanges(path, values.add, add);
  //pushChanges(path, values.del, del);
}