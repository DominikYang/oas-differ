import * as _ from "lodash";
import { Change } from "./change";

export function compareString(path: string,
  left: string, right: string, change: any[]) {
  if (left != right) {
    let temp = {
      "path": path,
      "change": new Change(left, right)
    }
    change.push(temp);
  }
}

function compareValue(path: string,
  left: any, right: any,
  add: any[], del: any[], change: any[]) {
} 

function compareArray(path: string,
  left: any[], right: any[],
  add: any[], del: any[], change: any[]) {

}