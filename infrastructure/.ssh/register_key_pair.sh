aws ec2 import-key-pair \
    --key-name "bastion-key" \
    --public-key-material fileb://./bastion_key.pub \
    --region ap-northeast-1
