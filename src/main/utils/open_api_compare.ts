import { compareValues } from "./keys_diff";
import * as $RefParser from "@apidevtools/json-schema-ref-parser";
import * as  _ from "lodash";

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { compareString, compareTypes, pushChanges } from "./basic_compare";

const public_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged.yml'));
const test_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test-merged.yml'));
const test_one = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_one.yml'));
const test_two = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_two.yml'));

$RefParser.dereference(public_merged, (err, schema) => {
  if (err) {
    console.error(err);
  }
  else {
    // `schema` is just a normal JavaScript object that contains your entire JSON Schema,
    // including referenced files, combined into a single object
    // console.log(schema.paths);
    // fs.writeFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged2.yml', schema);
    // console.log(schema.paths['/v1.0/xdr/workbench/workbenches/{workbenchId}']['get']['responses']['200']['content']['application/json']['schema']);
  }
})

let temp = compareOpenApi(public_merged, test_merged);
console.log('add');
console.log(temp.add);
console.log('del');
console.log(temp.del);
console.log('change');
console.log(temp.change);



function compareOpenApi(left: any, right: any) {
  let add = [], del = [], change = [];
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = keys.same;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'paths') {
      //compare paths
      comparePaths('paths', left[element], right[element], [], add, del, change);
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
      ignore, add, del, change);
    //TODO summary description servers
  }
  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareMethods(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameMethods = keys.same;

  for (let i = 0; i < sameMethods.length; i++) {
    const element = sameMethods[i];
    if (element == 'get' || element == 'put' || element == 'post' || element == 'delete' ||
      element == 'options' || element == 'head' || element == 'patch' || element == 'trace') {
      compareMethod(path + '/' + element, left[element], right[element],
        ignore, add, del, change);
    } else if (element == 'parameters') {
      compareParameters(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareMethod(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'summary' || element == 'description') {
      compareString(path + '/' + element, left[element], right[element], change);
    }
    else if (element == 'requestBody') {
      compareRquestBody(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'parameters') {
      compareParameters(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'responses') {
      compareResponses(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}


function compareParameters(path: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  if (left == undefined && right != undefined) {
    // add
    pushChanges(path, right, add);
  } else if (left != undefined && right == undefined) {
    // del
    pushChanges(path, left, del);
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
    pushChanges(path, compares.add, add);
    pushChanges(path, compares.del, del);
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
      compareParameter(path + '/' + compares.same[i],
        left[leftMap.get(compares.same[i])],
        right[rightMap.get(compares.same[i])],
        ignore, add, del, change);
    }
  }
}

function compareParameter(path: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  // console.log(sameKeys);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'in' || element == 'description' || element == 'required'
      || element == 'deprecated' || element == 'allowEmptyValue') {
      compareString(path + '/' + element, left[element], right[element], change);
    }
    else if (element == 'schema') {
      compareSchema(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareRquestBody(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'description' || element == 'required') {
      compareString(path + '/' + element, left[element], right[element], change);
    }
    if (element == 'content') {
      //compare contents
      compareContents(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareResponses(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  // compare ResponseObject
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareResponse(path + '/' + element, left[element], right[element],
      ignore, add, del, change);
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareContent(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  //filter ignore keys;
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'schema') {
      //compare schema
      compareSchema(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'example') {
      //TODO compare example
    }
    else if (element == 'examples') {
      //TODO compare examples
    }
    else if (element == 'encoding') {
      //TODO compare encoding
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}


function compareSchema(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'type') {
      compareTypes(path + '/' + element, left.type, right.type, add, del, change);
    }
    else if (element == 'oneOf' || element == 'allOf' || element == 'anyOf' || element == 'not') {
      //TODO 万一有一边的schma为空？
      compareSchemas(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'properties') {
      compareProperties(path + '/properties',
        left.properties, right.properties, ignore, add, del, change);
    }
    else if (element == 'description') {
      compareString(path + '/' + element, left[element], right[element], change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareSchemas(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  // 如果oneof/allof/anyof/not允许不是数组的话，这么比较会出问题
  // 万一有一边的schma为空？
  if (_.isArray(left) && _.isArray(right)) {
    let minLength = Math.min(left.length, right.length);
    for (let i = 0; i < minLength; i++) {
      compareSchema(path, left[i], right[i], ignore, add, del, change);
    }
  } else if (_.isObject(left) && _.isObject(right)) {
    compareSchema(path, left, right, ignore, add, del, change);
  } else if (_.isObject(left) && _.isArray(right)) {
    compareSchema(path, left, right[0], ignore, add, del, change);
  } else if (_.isArray(left) && _.isArray(right)) {
    compareSchema(path, left[0], right, ignore, add, del, change);
  }
}

function compareResponse(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'description') {
      compareString(path + '/description', left.description, right.description, change);
    }
    else if (element == 'headers') {
      //compare headers
      compareHeaders(path + '/' + element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'content') {
      //compare contents
      compareContents(path + '/content', left.content, right.content, ignore, add, del, change);
    }
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareContents(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    compareContent(path + '/' + sameKeys[i], left[sameKeys[i]], right[sameKeys[i]],
      ignore, add, del, change);
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}

function compareProperties(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  let addKeys = keys.add;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareProperty(path, left[element], right[element], ignore, add, del, change);
  }

  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);

}

function compareProperty(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    // 暂时只比较type change，忽略其它
    if (element == 'type') {
      compareTypes(path + '/' + element, left[element], right[element], add, del, change);
    }
    if (element == 'properties') {
      // 不需要加properties，把所有结果放在同一层
      compareProperties(path, left[element], right[element], ignore, add, del, change);
    }
  }

  //如果删除或者添加了一个properties类型的元素，则需要递归展开子层，把节点都添加进去
  if (_.includes(keys.add, 'properties')) {
    dfsProperties(path, right.properties, add);
  }
  if (_.includes(keys.del, 'properties')) {
    dfsProperties(path, left.properties, del);
  }

  pushChanges(path, _.difference(keys.add, 'properties'), add);
  pushChanges(path, _.difference(keys.del, 'properties'), del);
}

function dfsProperties(path: string, jsonProper: any, list: any[]) {
  let keys = Object.keys(jsonProper);
  let filterKeys = _.difference(keys, 'properties');
  pushChanges(path, filterKeys, list);
  if (_.includes(keys, 'properties')) {
    dfsProperties(path, jsonProper.properties, list);
  }
}

function compareHeaders(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareParameter(path + '/' + element, left[element], right[element], ignore, add, del, change);
  }
  pushChanges(path, keys.add, add);
  pushChanges(path, keys.del, del);
}