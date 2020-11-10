import * as AWS from "aws-sdk";
const ec2 = new AWS.EC2();
const { INSTANCE_ID, USERNAME } = process.env;

export const handler = async () => {
  const InstanceIds = [INSTANCE_ID!];
  const { Reservations } = await ec2
    .describeInstances({ InstanceIds })
    .promise();

  const instance = Reservations![0].Instances![0];
  switch (instance.State!.Code) {
    case 0:
      return "Instance starting";
    case 16:
      return `ssh://${USERNAME}@${instance.PublicDnsName}`;
    case 64:
      return "Instance stopping";
    case 80:
      await ec2.startInstances({ InstanceIds }).promise();
      return "Instance started";
    default:
      console.log(instance.State);
      return "Unhandled error";
  }
};
