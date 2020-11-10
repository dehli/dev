import * as core from "monocdk";
import * as cloudwatch from "monocdk/aws-cloudwatch";
import * as ec2 from "monocdk/aws-ec2";

export interface AlarmProps {
  evaluationPeriods: number;
  instance: ec2.Instance;
  period: core.Duration;
  region: string;
}

export class Alarm extends cloudwatch.Alarm {
  constructor(scope: core.Construct, id: string, { evaluationPeriods, instance, period, region }: AlarmProps) {
    super(scope, id, {
      metric: new cloudwatch.Metric({
        dimensions: { "InstanceId": instance.instanceId },
        metricName: "CPUUtilization",
        namespace: "AWS/EC2",
      })
        .with({ period })
        .with({ statistic: "max" }),
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods,
      threshold: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    (this.node.defaultChild as cloudwatch.CfnAlarm).alarmActions = [
      `arn:aws:automate:${region}:ec2:stop`
    ];
  }
}
