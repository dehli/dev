import { App, Stack } from "monocdk";
import { Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, Vpc } from "monocdk/aws-ec2";

const app = new App();
const stack = new Stack(app, "DehliDev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

new Instance(stack, "Instance", {
  instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
  machineImage: MachineImage.latestAmazonLinux(),
  vpc: Vpc.fromLookup(stack, "Vpc", { isDefault: true })
});
