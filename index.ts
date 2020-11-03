import * as core from "monocdk";
import * as ec2 from "monocdk/aws-ec2";

const app = new core.App();
const stack = new core.Stack(app, "DehliDev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

new ec2.Instance(stack, "Instance", {
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
  machineImage: ec2.MachineImage.latestAmazonLinux({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
  }),
  vpc: ec2.Vpc.fromLookup(stack, "Vpc", { isDefault: true })
});
