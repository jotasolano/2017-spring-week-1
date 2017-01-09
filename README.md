# 2017-spring-week-1

##Basic set-up: you only have to do it once for this course
To start, you must have both node.js and the `http-server` npm module installed
1. Go to [this link](http://https://nodejs.org/en/)	to download and install node.js
2. Once node.js is installed, install the `http-server` npm module globally. In terminal, type in
```
npm install http-server -g
```
Note that `-g` is an options flag, indicating that `http-server` is installed globally. You no longer have to install it again.

##To run `http-server`
1.In terminal, navigate to the `dist` folder
2.Type in
```
http-server
```
The content located in the `/public` foler will be served from localhost:8080. We are in business!

##To switch between branches of this repo
To switch to a different branch in this repo, type in
```
git checkout [branch name]
```
To see which branch you are on, type in
```
git branch
```
