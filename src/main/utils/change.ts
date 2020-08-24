export class Change {
  private left: any | string;
  private right: any | string;
  constructor(left: any, right: any) {
    this.left = left;
    this.right = right;
  }
}