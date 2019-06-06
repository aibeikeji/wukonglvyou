Command line instructions

Git global setup
git config --global user.name "Administrator"
git config --global user.email "admin@example.com"

Create a new repository
git clone http://192.168.1.22:30086/applets/weixin.git
cd weixin
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master

Existing folder
cd existing_folder
git init
git remote add origin http://192.168.1.22:30086/applets/weixin.git
git add .
git commit -m "Initial commit"
git push -u origin master

Existing Git repository
cd existing_repo
git remote rename origin old-origin
git remote add origin http://192.168.1.22:30086/applets/weixin.git
git push -u origin --all
git push -u origin --tags