import * as AWS from "aws-sdk";
const ec2 = new AWS.EC2();
const { INSTANCE_ID, USERNAME } = process.env;

const error = (error: string) => ({
  statusCode: 400,
  body: JSON.stringify({ error })
});

export const handler = async () => {
  const InstanceIds = [INSTANCE_ID!];
  const { Reservations } = await ec2.describeInstances({ InstanceIds }).promise();

  const instance = Reservations![0].Instances![0];
  switch (instance.State!.Code) {
    case 16:
      // The instance is running so we redirect to its url
      return {
        statusCode: 302,
        headers: { Location: `ssh://${USERNAME}@${instance.PublicDnsName}` }
      };

    case 80:
      // The instance is currently stopped so we'll need to start it up
      await ec2.startInstances({ InstanceIds }).promise();
      return error("Instance started");

    default:
      return error("Instance unavailable");
  }
};
