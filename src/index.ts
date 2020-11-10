import * as core from "monocdk";
import * as ec2 from "monocdk/aws-ec2";
import { Stack } from "./stack";

const app = new core.App();
new Stack(app, "DehliDev", {
  keyName: process.env.KEY_NAME,
  instanceSize: ec2.InstanceSize.SMALL,
});
