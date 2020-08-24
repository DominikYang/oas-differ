import { compareValues } from "./keys_diff";
import * as $RefParser from "@apidevtools/json-schema-ref-parser";
import * as  _ from "lodash";

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { compareString } from "./basic_compare";

const public_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/public-merged.yml'));
const test_merged = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test-merged.yml'));
const test_one = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_one.yml'));
const test_two = yaml.safeLoad(fs.readFileSync('C:/WorkSpace/code/frontend/swagger-differ-compare/src/resources/test_two.yml'));

// console.log(public_merged.paths['/v1.0/xdr/workbench/workbenches/{workbenchId}']['get']['responses']['200']['content']['application/json']['schema']);

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

compareOpenApi(public_merged, test_merged);

function compareOpenApi(left: any, right: any) {
  let add = [], del = [], change = [];
  //compare paths
  comparePaths('paths', left.paths, right.paths, [], add, del, change);

}

/**
 * 
 * @param path 'paths'
 * @param left 
 * @param right 
 * @param ignore 
 * @param add 
 * @param del 
 * @param change 
 */
function comparePaths(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let addApi = keys.add;
  let delApi = keys.del;
  let sameApi = keys.same;
  // console.log(sameApi);

  //for
  for (let i = 0; i < sameApi.length; i++) {
    compareMethods(path + sameApi[i],
      left[sameApi[i]], right[sameApi[i]],
      ignore, add, del, change);
  }
}

function compareMethods(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let addMethods = keys.add;
  let delMethods = keys.del;
  let sameMethods = keys.same;

  //compare parameters
  for (let i = 0; i < sameMethods.length; i++) {
    //  console.log(left[sameMethods[i]]);
    //if has property parameters
    compareParameters(path + '/' + sameMethods[i],
      left[sameMethods[i]].parameters, right[sameMethods[i]].parameters,
      ignore, add, del, change)
    
    //TODO compare requestBody
    //TODO compare responses
  }
}

// 比较每个请求method里面的parameter的变化情况
function compareParameters(path: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  // console.log(left);
  if (left == undefined && right != undefined) {
    //add
  } else if (left != undefined && right == undefined) {
    //del
  } else if(left != undefined && right != undefined){
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
    let sameCompares = compares.same;
    // console.log(compares);

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
  let sameKeys = keys.same;
  // console.log(sameKeys);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    // console.log(sameKeys[i]);
    
    if (element == 'in' && !_.includes(ignore, 'in')) {
      compareString(path, left.in, right.in, change);
    }
    if (element == 'description' && !_.includes(ignore, 'description')) {
      compareString(path, left.description, right.description, change);
    }
    if (element == 'required' && !_.includes(ignore, 'required')) {
       //TODO compare boolean
      compareString(path, left.required, right.required, change);
    }
    if (element == 'deprecated' && !_.includes(ignore, 'deprecated')) {
       //TODO compare boolean
      compareString(path, left.deprecated, right.deprecated, change);
    }
    if (element == 'allowEmptyValue' && !_.includes(ignore, 'allowEmptyValue')) {
       //TODO compare boolean
      compareString(path, left.allowEmptyValue, right.allowEmptyValue, change);
    }
    if (element == 'schema' && !_.includes(ignore, 'schema')) {
      //TODO compare schema
    }
  }
}

function compareRquestBody(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = keys.same;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'description' && !_.includes(ignore, 'description')) {
      compareString(path, left.description, right.description, change);
    }
    if (element == 'required' && !_.includes(ignore, 'required')) {
      compareString(path, left.required, right.required, change);
    }
    if (element == 'content' && !_.includes(ignore, 'content')) {
      //TODO compare contents
    }
  }
}

function compareResponses(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let leftResponseCode = Object.keys(left), rightResponseCode = Object.keys(right);
  let addCode = _.difference(rightResponseCode, leftResponseCode);
  let delCode = _.difference(leftResponseCode, rightResponseCode);
  let sameCode = _.intersection(leftResponseCode, rightResponseCode);
  //TODO compare ResponseObject
}

function compareContents(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  //filter ignore keys;
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'schema') {
      //TODO compare schema
    }
    if (element == 'example') {
      //TODO compare example
    }
    if (element == 'examples') {
      //TODO compare examples
    }
    if (element == 'encoding') {
      //TODO compare encoding
    }
  }
}

function compareSchema(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    //TODO compare JSON Schema definition properties
    
  }
}