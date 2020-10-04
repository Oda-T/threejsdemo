set -e

# git init

git add -A

git commit -m 'test'

git push -f git@github.com:Oda-T/threejsdemo.git master:master

cd -