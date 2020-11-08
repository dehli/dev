import * as core from "monocdk";
import * as cloudwatch from "monocdk/aws-cloudwatch";
import * as ec2 from "monocdk/aws-ec2";

export interface AlarmProps {
  instance: ec2.Instance;
  region: string;
}

export class Alarm extends cloudwatch.Alarm {
  constructor(scope: core.Construct, id: string, { instance, region }: AlarmProps) {
    super(scope, id, {
      metric: new cloudwatch.Metric({
        dimensions: { "InstanceId": instance.instanceId },
        metricName: "CPUUtilization",
        namespace: "AWS/EC2",
      })
        .with({ period: core.Duration.minutes(15) })
        .with({ statistic: "max" }),
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 4,
      threshold: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    (this.node.defaultChild as cloudwatch.CfnAlarm).alarmActions = [
      `arn:aws:automate:${region}:ec2:stop`
    ];
  }
}
