import * as _ from "lodash";

export function compareKeys(left: string[], right: string[]) {
  let add = _.difference(right, left);
  let del = _.difference(left, right);
  let same = _.intersection(left, right);

  return {
    "add": add,
    "del": del,
    "same":same
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

export function compareArrays(left: any, right: any) {
  
  
}