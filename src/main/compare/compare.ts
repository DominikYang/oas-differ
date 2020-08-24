import { compareValues, compareValue } from "../utils/keys_diff";

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from "lodash";

const public_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged.yml'));
const test_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test-merged.yml'));
const test_one = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_one.yml'));
const test_two = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_two.yml'));


export function compare(left: any, right: any) {
  let apis = compareApi(left, right);
  let add = [], del = [], change = [];
  let sameMethods = apis.sameMethods;  
  let sameApis = apis.sameApis; 
  
  for (let i = 0; i < sameApis.length; i++) {
    let methods = Object.keys(left.paths[sameApis[i]]);
    for (let j = 0; j < methods.length; j++) {
      if (_.includes(sameMethods, sameApis[i] + '/' + methods[j])) {        
        // compare parameters
        if (left.paths[sameApis[i]][methods[j]].hasOwnProperty("parameters")) {
          compareParameters(
            'paths' +sameApis[i]+ '/' + methods[j] + '/' + 'parameters',
            left.paths[sameApis[i]][methods[j]].parameters, right.paths[sameApis[i]][methods[j]].parameters,
            [],add,del,change
          )
        }
        //  compare responses
        if (left.paths[sameApis[i]][methods[j]].hasOwnProperty("responses")) {
          
        }
        //  compare requestbody
      }
    }
  }
  console.log(change);
}

function compareApi(left: any, right: any) {
  let keys = compareValues(Object.keys(left.paths), Object.keys(right.paths));
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

  let sameMethods = [];
  for (let i = 0; i < sameApi.length; i++) {
    let tempLeftKeys = Object.keys(left.paths[sameApi[i]]);
    let tempRightKeys = Object.keys(right.paths[sameApi[i]]);
    let tempDelMethods = _.difference(tempLeftKeys, tempRightKeys);
    let tempAddMethods = _.difference(tempRightKeys, tempLeftKeys);
    let tempSameMethods = _.intersection(tempLeftKeys, tempRightKeys);
    for (let j = 0; j < tempDelMethods.length; j++) {
      delMethods.push(sameApi[i] + tempDelMethods[j]);
    }
    for (let j = 0; j < tempAddMethods.length; j++) {
      addMethods.push(sameApi[i] + '/' + tempAddMethods[j]);
    }
    for (let j = 0; j < tempSameMethods.length; j++) {
      sameMethods.push(sameApi[i] + '/' + tempSameMethods[j]);
    }
  }
  return {
    "add": addMethods,
    "del": delMethods,
    "sameApis":sameApi,
    "sameMethods":sameMethods
  }
}

// compareParameters('parameters', test_one.parameters, test_two.parameters, [], [], [], []);
compare(public_merged, test_merged);
// 比较每个请求method里面的parameter的变化情况
function compareParameters(path: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  
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
  // 记录same节点的index
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
    compareParameter(path +'/'+ compares.same[i],
      left[leftMap.get(compares.same[i])],
      right[rightMap.get(compares.same[i])],
      ignore, add, del, change);
  }
  
}

function compareParameter(path: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = keys.same;
  for (let i = 0; i < sameKeys.length; i++) {
    let tempKey = compareValue(left[sameKeys[i]], right[sameKeys[i]]);
    if (tempKey.change) {
      let temp = {
        "path": path + '/' + sameKeys[i],
        "left": tempKey.left,
        "right":tempKey.right
      }
      change.push(temp);
    }
  }
}

function compareResponses(path: string, left: any, right: any, ignore: string[], add: any[], del: any[], change: any[]) {
  let leftResponseCode = Object.keys(left), rightResponseCode = Object.keys(right);
  let addCode = _.difference(rightResponseCode, leftResponseCode);
  let delCode = _.difference(leftResponseCode, rightResponseCode);
  let sameCode = _.intersection(leftResponseCode, rightResponseCode);
  //compare ResponseObject
}

function compareHeaders(params:any) {
  
}

function compareProperties(left: any, right: any, ignore: any[], add: any[], del: [], channge: any[]) {
  
}
