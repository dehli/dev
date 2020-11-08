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
const runAsUser = (cmd: string) => `runuser -l ${user} -c '${cmd}'`;

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
  "yum install -y gcc git util-linux-user zsh",
  `yum groupinstall -y "Development Tools"`,
  runAsUser("sudo chsh -s $(which zsh) $(whoami)"),
  runAsUser(`ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""`),
  runAsUser("rm -f ~/.bash*"),
  runAsUser(`sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`),
  runAsUser(`sh -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`),
  runAsUser(`echo "eval \\$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" > ~/.zshrc`),
  runAsUser(`echo "export ZSH=\\$HOME/.oh-my-zsh && source \\$ZSH/oh-my-zsh.sh" >> ~/.zshrc`),
);
