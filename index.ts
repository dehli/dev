import * as core from "monocdk";
import * as ec2 from "monocdk/aws-ec2";

const app = new core.App();
const stack = new core.Stack(app, "DehliDev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    repository: "https://github.com/dehli/dev"
  }
});

const vpc = ec2.Vpc.fromLookup(stack, "Vpc", { isDefault: true });
const securityGroup = new ec2.SecurityGroup(stack, "SecurityGroup", { vpc });
securityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(22));

const user = "ec2-user";
const userHome = `/home/${user}`;

const instance = new ec2.Instance(stack, "Instance", {
  keyName: process.env.KEY_NAME,
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
  machineImage: ec2.MachineImage.latestAmazonLinux({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
  }),
  securityGroup,
  userDataCausesReplacement: true,
  vpc,
});

instance.userData.addCommands(
  "yum update -y",
  "yum install -y gcc",
  "yum install -y git",
  "yum install -y util-linux-user",
  "yum install -y zsh",
  `sudo chsh -s $(which zsh) ${user}`,
  `ssh-keygen -t rsa -b 4096 -f ${userHome}/.ssh/id_rsa -N ''`,
  `rm -f ${userHome}/.bash_history`,
  `rm -f ${userHome}/.bash_logout`,
  `rm -f ${userHome}/.bash_profile`,
  `rm -f ${userHome}/.bashrc`,
  `touch ${userHome}/.zshrc`
);
