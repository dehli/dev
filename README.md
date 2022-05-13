# Getting Started

1. [Add Key Pair](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:) (note the name)
2. `npm install`
3. `export KEY_NAME=your_key_name && npm run deploy`
4. Use the exported url to start the dev server (if not running).
5. `ssh -i <pem from above> <url from above>`
