db_host=${1}
public_ip=${2}
ssh -v -N -L 5433:${db_host}:5432 ec2-user@${public_ip} -i ./bastion_key
