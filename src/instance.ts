import * as core from "monocdk";
import * as ec2 from "monocdk/aws-ec2";

export interface ApiProps {
  instanceSize: ec2.InstanceSize;
  keyName?: string;
}

export class Instance extends ec2.Instance {
  readonly username = "ec2-user";

  constructor(scope: core.Construct, id: string, props: ApiProps) {
    super(scope, id, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, props.instanceSize),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userDataCausesReplacement: true,
      ...Instance.vpc(scope, id),
      ...props,
    });

    const runAsUser = (cmd: string) => `runuser -l ${this.username} -c '${cmd}'`;
    this.userData.addCommands(
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
  }

  private static vpc(scope: core.Construct, id: string) {
    const vpc = ec2.Vpc.fromLookup(scope, `${id}Vpc`, { isDefault: true });
    const securityGroup = new ec2.SecurityGroup(scope, `${id}SecurityGroup`, { vpc });
    securityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    return { securityGroup, vpc };
  }
}
