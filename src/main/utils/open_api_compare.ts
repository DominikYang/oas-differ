import * as  _ from "lodash";
import { compareString, compareArrayString, pushChanges, compareValues, pushPropertyChanges, pushPropertyChange, removeParameters, pushChangesWithType } from "./basic_compare";
import { operationObjectIgnore, parameterObjectIgnore, mediaTypeObjectIgnore, pathItemObjectIgnore } from "./ignore";

let leftApiMap = new Map<string, string>();
let rightApiMap = new Map<string, string>();


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
  let rawLeftKeys = Object.keys(left);
  let rawRightKeys = Object.keys(right);
  let keys = compareValues(rawLeftKeys, rawRightKeys);
  let sameApi = _.difference(keys.same, ignore);

  for (let i = 0; i < sameApi.length; i++) {
    const element = sameApi[i];
    compareMethods(path + rightApiMap.get(element),
      left[element], right[element],
      pathItemObjectIgnore, add, del, change);
  }
  pushChanges(path, '', '', 'paths', keys.add, add);
  pushChanges(path, '', '', 'paths', keys.del, del);
}

function compareMethods(path: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameMethods = _.difference(keys.same, ignore);

  for (let i = 0; i < sameMethods.length; i++) {
    const element = sameMethods[i];
    // unsupported externalDocs servers callbacks security
    if (element == 'get' || element == 'put' || element == 'post' || element == 'delete' ||
      element == 'options' || element == 'head' || element == 'patch' || element == 'trace') {
      compareMethod(path, '' + element, '/', element, left[element], right[element], operationObjectIgnore, add, del, change);
    } else if (element == 'parameters') {
      compareParameters(path, '', '', left[element], right[element], parameterObjectIgnore, add, del, change);
    } else if (element == 'summary' || element == 'description' || element == 'operatinId' || element == 'deprecated') {
      compareString(path, '', element, '', left[element], right[element], change);
    }
  }

  pushChanges(path, '', '/', 'paths', keys.add, add);
  pushChanges(path, '', '/', 'paths', keys.del, del);
}

function compareMethod(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'summary' || element == 'description') {
      compareString(path, '', method, element, left[element], right[element], change, method);
    }
    else if (element == 'requestBody') {
      compareRquestBody(path, method, '/' + element, key, element,
        left[element], right[element], ['description'], add, del, change);
    }
    else if (element == 'parameters') {
      compareParameters(path, method, '/' + element, left[element], right[element], parameterObjectIgnore, add, del, change);
    }
    else if (element == 'responses') {
      compareResponses(path, method, '/' + element, left[element], right[element], [], add, del, change);
    }
    else if (element == 'tags') {
      compareTags(path, method, '/' + element, left[element], right[element], [], add, del, change);
    }
  }

  pushChanges(path, method, location, 'paths', keys.add, add);
  pushChanges(path, method, location, 'paths', keys.del, del);
}

function compareParameters(path: string, method: string, location: string,
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
  let delMap = new Map<string, number>();
  let leftMap = new Map<string, number>();
  for (let i = 0; i < left.length; i++) {
    if (left[i].hasOwnProperty("name")) {
      if (_.includes(compares.same, left[i].name)) {
        leftMap.set(left[i].name, i);
      } else {
        delMap.set(left[i].name, i);
      }
    }
  }

  let addMap = new Map<string, number>();
  let rightMap = new Map<string, number>();
  for (let i = 0; i < right.length; i++) {
    if (right[i].hasOwnProperty("name")) {
      if (_.includes(compares.same, right[i].name)) {
        rightMap.set(right[i].name, i);
      } else {
        addMap.set(right[i].name, i);
      }
    }
  }

  for (let i = 0; i < compares.del.length; i++) {
    const element = compares.del[i];
    let temp = '';
    if (left[delMap.get(element)].hasOwnProperty('schema')) {
      temp = left[delMap.get(element)]['schema']['type'];
    }
    temp === undefined ? '' : temp;
    pushChangesWithType(path, method, location, temp, element, del);
  }

  for (let i = 0; i < compares.add.length; i++) {
    const element = compares.add[i];
    let temp = '';
    if (right[addMap.get(element)].hasOwnProperty('schema')) {
      temp = right[addMap.get(element)]['schema']['type'];
    }
    temp === undefined ? '' : temp;
    pushChangesWithType(path, method, location, temp, element, add);
  }



  for (let i = 0; i < compares.same.length; i++) {
    const element = compares.same[i];
    compareParameter(path, method, location, element,
      left[leftMap.get(element)], right[rightMap.get(element)],
      ignore, add, del, change);
  }

}

function compareParameter(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: string[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);


  // let leftSchemaType = undefined;
  // if (left.hasOwnProperty('schema')) {
  //   leftSchemaType = left['schema']['type'];
  // }
  // leftSchemaType === undefined ? '' : leftSchemaType;

  // let rightSchemaType = undefined;
  // if (right.hasOwnProperty('schema')) {
  //   rightSchemaType = right['schema']['type'];
  // }
  // rightSchemaType === undefined ? '' : rightSchemaType;

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'in' || element == 'description' || element == 'required'
      || element == 'deprecated' || element == 'allowEmptyValue') {
      compareString(path, location, key, element, left[element], right[element], change, method);
    }
    else if (element == 'schema') {
      compareSchema(path, method, location + '/' + element, key, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareRquestBody(path: string, method: string, location: string, key: string, property: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'description' || element == 'required') {
      compareString(path, location, key, element, left[element], right[element], change, method);
    }
    if (element == 'content') {
      //compare contents
      compareContents(path, method, location + '/' + element, key, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareResponses(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  // compare ResponseObject
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareResponse(path, method, location + '/' + element, element, left[element], right[element],
      ['description'], add, del, change);
  }

  pushChanges(path, method, location, 'responses', keys.add, add);
  pushChanges(path, method, location, 'responses', keys.del, del);
}

function compareContent(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  //filter ignore keys;
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'schema') {
      //compare schema
      compareSchema(path, method, location + '/' + element, element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'example') {
      // compare example
    }
    else if (element == 'examples') {
      // compare examples
    }
    else if (element == 'encoding') {
      // compare encoding
    }
  }

  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareSchema(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'type') {
      compareArrayString(path, location, key, element, left[element], right[element], add, del, change, method);
    }
    else if (element == 'oneOf' || element == 'allOf' || element == 'anyOf' || element == 'not') {
      compareSchemas(path, method, location + '/' + element, element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'properties') {
      compareProperties(path, method, location + '/' + element, element,
        left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'description') {
      compareString(path, location, 'schema', element, left[element], right[element], change, method);
    }
  }

  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareSchemas(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  if (_.isArray(left) && _.isArray(right)) {
    let minLength = Math.min(left.length, right.length);
    for (let i = 0; i < minLength; i++) {
      compareSchema(path, method, location, key, left[i], right[i], ignore, add, del, change);
    }
  } else if (_.isObject(left) && _.isObject(right)) {
    compareSchema(path, method, location, key, left, right, ignore, add, del, change);
  } else if (_.isObject(left) && _.isArray(right)) {
    compareSchema(path, method, location, key, left, right[0], ignore, add, del, change);
  } else if (_.isArray(left) && _.isArray(right)) {
    compareSchema(path, method, location, key, left[0], right, ignore, add, del, change);
  }
}

function compareResponse(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    //unsupport links
    if (element == 'description') {
      compareString(path, location, key, element, left.description, right.description, change, method);
    }
    else if (element == 'headers') {
      //compare headers
      compareHeaders(path, method, location + '/' + element, element, left[element], right[element], ignore, add, del, change);
    }
    else if (element == 'content') {
      //compare contents
      compareContents(path, method, location + '/' + element, element, left[element], right[element], ignore, add, del, change);
    }
  }

  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareContents(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareContent(path, method, location + '/' + element, element, left[element], right[element],
      mediaTypeObjectIgnore, add, del, change);
  }
  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareProperties(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareProperty(path, method, location, element, left[element], right[element], ignore, add, del, change);
  }

  pushPropertyChanges(path, method, location, keys.add, right, add);
  pushPropertyChanges(path, method, location, keys.del, left, del);
}

function compareProperty(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);

  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    // just compare type change for now
    if (element == 'type') {
      compareArrayString(path, location, key, element,
        left[element], right[element], add, del, change, method);
    } else if (element == 'oneOf') {
      //compare each property
      compareOneOfPropertyObject(path, method, location + '/' + element, key,
        left[element], right[element], [], add, del, change);
    }
    else if (element == 'properties') {
      compareProperties(path, method, location + '/' + key + '/' + element, element,
        left[element], right[element], ignore, add, del, change);
    } else if (element == 'items') {
      // compare items Object
      compareItemsObject(path, method, location + '/' + element, key, element,
        left[element], right[element], [], add, del, change);
    }
  }

  pushPropertyChanges(path, method, location, _.differenceWith(keys.add, 'properties', _.isEqual), right, add);
  pushPropertyChanges(path, method, location, _.differenceWith(keys.add, 'properties', _.isEqual), left, del);
  if (_.includes(keys.add, 'properties')) {
    pushPropertyChanges(path, method, location + '/' + key + '/properties', Object.keys(right.properties), right.properties, add);
  }
  if (_.includes(keys.del, 'properties')) {
    pushPropertyChanges(path, method, location + '/' + key + '/properties', Object.keys(left.properties), left.properties, add);
  }
}

function compareOneOfPropertyObject(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  if (_.isArray(left) && _.isArray(right)) {
    let minLen = Math.min(left.length, right.length);
    for (let i = 0; i < minLen; i++) {
      compareProperty(path, method, location, key, left[i], right[i], [], add, del, change);
    }
    //pushchanges
    if (right.length > minLen) {
      for (let i = minLen; i < right.length; i++) {
        //add
        let changes = pushPropertyChange(path, method, location, 'oneOf', right[i].type);
        add.push(changes);
      }
    } else if (left.length > minLen) {
      for (let i = 0; i < left.length; i++) {
        //del
        let changes = pushPropertyChange(path, method, location, 'oneOf', left[i].type);
        del.push(changes);
      }
    }
  }
}

function compareItemsObject(path: string, method: string, location: string, key: string, property: string,
  left: any, right: any, ignore: string[], add: any[], del: any[], change: any[]
) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    if (element == 'required') {
      compareArrayString(path, location, property, element, left[element], right[element], add, del, change, method);
    } else if (element == 'properties') {
      compareProperties(path, method, location + '/' + element, element, left[element], right[element], [], add, del, change);
    }
  }
}

function compareHeaders(path: string, method: string, location: string, key: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let keys = compareValues(Object.keys(left), Object.keys(right));
  let sameKeys = _.difference(keys.same, ignore);
  for (let i = 0; i < sameKeys.length; i++) {
    const element = sameKeys[i];
    compareParameter(path, method, location + '/' + element, element, left[element], right[element], ignore, add, del, change);
  }
  pushChanges(path, method, location, key, keys.add, add);
  pushChanges(path, method, location, key, keys.del, del);
}

function compareTags(path: string, method: string, location: string,
  left: any, right: any,
  ignore: any[], add: any[], del: any[], change: any[]) {
  let values = compareValues(left, right);
  pushChanges(path, method, location, method, values.add, add);
  pushChanges(path, method, location, method, values.del, del);
}