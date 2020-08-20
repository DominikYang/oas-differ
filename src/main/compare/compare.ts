import { compareKeys, compareValues } from "../utils/keys_diff";

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from "lodash";

const public_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged.yml'));
const test_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test-merged.yml'));

// console.log(compare(public_merged, test_merged));


export function compare(left: any, right: any) {
  return compareApi(left, right);
}

function compareApi(left: any, right: any) {
  let keys = compareKeys(Object.keys(left.paths), Object.keys(right.paths));
  let addApi = _.cloneDeep(keys.add);
  let delApi = _.cloneDeep(keys.del);
  let sameApi = keys.same;

  let addMethods = [];
  for (let i = 0; i < addApi.length; i++) {
    let tempKeys = Object.keys(right.paths[addApi[i]]);
    for (let j = 0; j < tempKeys.length; j++) {
      const tempKey = tempKeys[j];
      addMethods.push(addApi[i] + tempKey);
    }
  }

  let delMethods = [];
  for (let i = 0; i < delApi.length; i++) {
    let tempKeys = Object.keys(left.paths[delApi[i]]);
    for (let j = 0; j < tempKeys.length; j++) {
      const tempKey = tempKeys[j];
      delMethods.push(delApi[i] + tempKey);
    }
  }

  for (let i = 0; i < sameApi.length; i++) {
    let tempLeftKeys = Object.keys(left.paths[sameApi[i]]);
    let tempRightKeys = Object.keys(right.paths[sameApi[i]]);
    let tempDelMethods = _.difference(tempLeftKeys, tempRightKeys);
    let tempAddMethods = _.difference(tempRightKeys, tempLeftKeys);
    for (let j = 0; j < tempDelMethods.length; j++) {
      delMethods.push(sameApi[i] + tempDelMethods[j]);
    }
    for (let j = 0; j < tempAddMethods.length; j++) {
      addMethods.push(sameApi[i] + tempAddMethods[j]);
    }
  }
  return {
    "add": addMethods,
    "del": delMethods
  }
}

// 比较每个请求method里面的parameter的变化情况
function compareParameters(path: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: []) {
  
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
  // 对于每一个same节点，需要去比较下一层的元素是否有变化
  for (let i = 0; i < left.length; i++) {
    if (left[i].hasOwnProperty("name")) {
      if (_.includes(compares.same, left[i].name)) {
        compareParameter(path + left[i].name, left[i], right[i], ignore, add, del, change);
      }
    }
  }
}


function compareParameter(path: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: []) {
  
}

function compareNodes(name: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: any[]) {
  let left_is_array, right_is_array, left_is_object, right_is_object;
  left_is_array = Array.isArray(left);
  right_is_array = Array.isArray(right);

  left_is_object = left_is_array === false && _.isObject(left);
  right_is_object = right_is_array === false && _.isObject(right);

  if (left_is_array && right_is_array) {
    return compareArrays(name, left, right, ignore, add, del, change);
    
  } else if (left_is_object && right_is_object) {
    return compareObjects(name, left, right, ignore, add, del, change);

  }

  if (!_.isEqual(left, right)) {
    let temp = { "left": left, "right": right };
    change.push(_.cloneDeep(temp));
  }
}

//todo
function compareArrays(name: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: any[]) {
  for (let i = 0; i < left.length; i++) {
    _.differenceWith(right, left[i], _.isEqual);
  }
}

function compareObjects(name: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: any[]) {
  let keysChanges = compareKeys(left, right);
  let sameKeys = keysChanges.same;
  for (let i = 0; i < keysChanges.add.length; i++) {
    add.push(name + keysChanges.add[i]);
  }
  for (let i = 0; i < keysChanges.del.length; i++) {
    del.push(name + keysChanges.del[i]);
  }
  for (let i = 0; i < sameKeys.length; i++) {
    compareNodes(name, left[sameKeys[i]], right[sameKeys[i]], ignore, add, del, change);
  }
}