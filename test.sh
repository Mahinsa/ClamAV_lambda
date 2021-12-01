export AWS_ACCESS_KEY_ID="AKIA3DPYYQUVNSEOVFMC"
export AWS_SECRET_ACCESS_KEY="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"

EVENT=''
BUCKET_NAME=''

while getopts 'e:b:' flag; do
    case ${flag} in
        e) EVENT="${OPTARG}" ;;
        b) BUCKET_NAME="${OPTARG}" ;;
    esac
done
export BUCKET_NAME=$BUCKET_NAME

echo $BUCKET_NAME

cd ./file-scanner


if [ $EVENT == 'Add' ]
then
    echo add
    sls deploy 
elif [ $EVENT == 'Remove' ] 
then
    echo remove
    sls remove
fi
