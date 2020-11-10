import * as core from "monocdk";
import * as ec2 from "monocdk/aws-ec2";
import { Alarm } from "./alarm";
import { Api } from "./api";
import { Instance } from "./instance";

export interface StackProps {
  inactiveCheck?: {
    evaluationPeriods: number;
    period: core.Duration;
  };
  instanceSize?: ec2.InstanceSize;
  keyName?: string;
}

export class Stack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: StackProps) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
      tags: {
        repository: "https://github.com/dehli/dev",
      },
    });

    const propsWithDefaults = {
      inactiveCheck: {
        evaluationPeriods: 4,
        period: core.Duration.minutes(15),
      },
      instanceSize: ec2.InstanceSize.MICRO,
      ...props,
    };

    const instance = new Instance(this, `${id}Instance`, propsWithDefaults);

    // Automatically stop the instance if it's been idle for > 60 minutes
    if (propsWithDefaults.inactiveCheck) {
      new Alarm(this, `${id}Inactive`, {
        ...propsWithDefaults.inactiveCheck,
        instance,
        region: this.region,
      });
    }

    // Expose the instance via an api (since the instance's url will be changing)
    new Api(this, `${id}Api`, { instance, username: instance.username });
  }
}
