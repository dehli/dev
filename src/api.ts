import * as core from "monocdk";
import * as api from "monocdk/aws-apigatewayv2";
import * as ec2 from "monocdk/aws-ec2";
import { PolicyStatement } from "monocdk/aws-iam";
import * as lambda from "monocdk/aws-lambda";
import * as fs from "fs";
import * as path from "path";

export interface ApiProps {
  instance: ec2.Instance;
  username: string;
}

export class Api extends api.HttpApi {
  constructor(scope: core.Construct, id: string, { instance, username }: ApiProps) {
    super(scope, id, {
      defaultIntegration: new api.LambdaProxyIntegration({
        handler: new lambda.Function(scope, `${id}Lambda`, {
          code: lambda.Code.fromInline(
            fs.readFileSync(path.resolve(__dirname, "handler.js")).toString()
          ),
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: "index.handler",
          environment: {
            INSTANCE_ID: instance.instanceId,
            USERNAME: username,
          },
          initialPolicy: [
            new PolicyStatement({
              actions: ["ec2:StartInstances", "ec2:StopInstances"],
              resources: [`arn:aws:ec2:*:*:instance/${instance.instanceId}`]
            }),
            new PolicyStatement({
              actions: ["ec2:DescribeInstances"],
              resources: ["*"]
            })
          ]
        })
      })
    });
  }
}
